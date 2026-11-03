// uploadVersion, getVersionsByRepo, getVersionFile (download), linkVersion (traceability)

const mongoose = require("mongoose");
const Version = require("../models/version.model");
const Repo = require("../models/repo.model");
const fileService = require("../services/file.service");
const asyncHandler = require("../utils/asyncHandler");
const fingerprintService = require("../services/fingerprint.service");
const lineageService = require("../services/lineage.service");

const VALID_TYPES = ["paper", "dataset", "experiment", "result"];

/** Shared access check: user must be the repo's owner or a collaborator */
const assertRepoAccess = (repo, userId) => {
  const isOwner = repo.owner.equals(userId);
  const isCollaborator = repo.collaborators.some((c) => c.user.equals(userId));
  return isOwner || isCollaborator;
};

/**
 * POST /api/versions/:repoId
 * multipart/form-data: file, type, notes?, derivedFrom? (comma-separated version ids)
 * Fingerprints the file, flags exact duplicates, records manual lineage,
 * then creates automatic lineage links.
 */
exports.uploadVersion = asyncHandler(async (req, res) => {
  const { repoId } = req.params;
  const { type, notes } = req.body;

  const repo = await Repo.findById(repoId);
  if (!repo) return res.status(404).json({ message: "Repo not found" });
  if (!assertRepoAccess(repo, req.user._id)) {
    return res.status(403).json({ message: "You don't have access to this repo" });
  }
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ message: `Type must be one of: ${VALID_TYPES.join(", ")}` });
  }

  // Inspect first: a corrupt zip/notebook is rejected before anything is stored
  const { contentHash, artifacts, notebook } = fingerprintService.inspectUpload(
    req.file.buffer,
    req.file.originalname
  );

  // Manual lineage: only ids that really belong to this repo are kept
  const parentIds = (req.body.derivedFrom || "")
    .split(",")
    .map((s) => s.trim())
    .filter(mongoose.isValidObjectId);
  const parents = parentIds.length
    ? await Version.find({ _id: { $in: parentIds }, repo: repoId }).select("_id")
    : [];

  const duplicates = await Version.find({ repo: repoId, contentHash }).select(
    "type versionNumber fileName createdAt"
  );

  const fileId = await fileService.uploadBuffer(req.file.buffer, req.file.originalname, req.file.mimetype);

  const lastVersion = await Version.findOne({ repo: repoId, type }).sort({ versionNumber: -1 });
  const versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

  const version = await Version.create({
    repo: repoId,
    uploadedBy: req.user._id,
    type,
    versionNumber,
    fileId,
    fileName: req.file.originalname,
    contentHash,
    artifacts,
    derivedFrom: parents.map((p) => ({ version: p._id, source: "manual", reason: "manual" })),
    notes,
  });

  const autoLinks = await lineageService.autoLink(version, notebook);

  res.status(201).json({ version, duplicates, autoLinks });
});

/**
 * POST /api/versions/:repoId/match
 * multipart/form-data: file
 * "I have this image/file. Where has it appeared?" The file is hashed and
 * compared only; it is NOT stored.
 */
exports.matchFile = asyncHandler(async (req, res) => {
  const repo = await Repo.findById(req.params.repoId);
  if (!repo) return res.status(404).json({ message: "Repo not found" });
  if (!assertRepoAccess(repo, req.user._id)) {
    return res.status(403).json({ message: "You don't have access to this repo" });
  }
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const hash = fingerprintService.hashBuffer(req.file.buffer);
  const matches = await lineageService.findMatches(repo._id, hash);

  res.status(200).json({ hash, matches });
});

/**
 * GET /api/versions/:id/lineage?depth=10
 * Everything this version was derived from (upstream) and everything derived
 * from it (downstream). Edges point from the input to the thing it produced.
 */
exports.getLineage = asyncHandler(async (req, res) => {
  const version = await Version.findById(req.params.id).populate("repo");
  if (!version) return res.status(404).json({ message: "Version not found" });
  if (!assertRepoAccess(version.repo, req.user._id)) {
    return res.status(403).json({ message: "You don't have access to this version" });
  }

  const maxDepth = Math.min(parseInt(req.query.depth, 10) || 10, 25) - 1;
  const repoId = version.repo._id;

  const lookup = (startWith, connectFromField, connectToField, as) => ({
    $graphLookup: {
      from: Version.collection.name,
      startWith,
      connectFromField,
      connectToField,
      as,
      maxDepth,
      restrictSearchWithMatch: { repo: repoId },
    },
  });
  const slim = (as) => ({
    $project: {
      [`${as}._id`]: 1,
      [`${as}.type`]: 1,
      [`${as}.versionNumber`]: 1,
      [`${as}.fileName`]: 1,
      [`${as}.createdAt`]: 1,
      [`${as}.derivedFrom`]: 1,
    },
  });

  const [[up], [down]] = await Promise.all([
    Version.aggregate([
      { $match: { _id: version._id } },
      lookup("$derivedFrom.version", "derivedFrom.version", "_id", "ancestors"),
      slim("ancestors"),
    ]),
    Version.aggregate([
      { $match: { _id: version._id } },
      lookup("$_id", "_id", "derivedFrom.version", "descendants"),
      slim("descendants"),
    ]),
  ]);

  const nodeMap = new Map();
  const addNode = (n) =>
    nodeMap.set(String(n._id), {
      _id: n._id,
      type: n.type,
      versionNumber: n.versionNumber,
      fileName: n.fileName,
      createdAt: n.createdAt,
      derivedFrom: n.derivedFrom || [],
    });
  addNode(version);
  (up?.ancestors || []).forEach(addNode);
  (down?.descendants || []).forEach(addNode);

  const edges = [];
  for (const n of nodeMap.values()) {
    for (const e of n.derivedFrom) {
      if (nodeMap.has(String(e.version))) {
        edges.push({ from: e.version, to: n._id, source: e.source, reason: e.reason });
      }
    }
  }
  const nodes = [...nodeMap.values()].map(({ derivedFrom, ...rest }) => rest);

  res.status(200).json({ root: version._id, nodes, edges });
});

/**
 * GET /api/versions/:repoId
 * Returns every version in a repo, most recent first, with uploader info populated.
 */
exports.getVersionsByRepo = asyncHandler(async (req, res) => {
  const { repoId } = req.params;

  const repo = await Repo.findById(repoId);
  if (!repo) return res.status(404).json({ message: "Repo not found" });
  if (!assertRepoAccess(repo, req.user._id)) {
    return res.status(403).json({ message: "You don't have access to this repo" });
  }

  const versions = await Version.find({ repo: repoId })
    .populate("uploadedBy", "name email role")
    .sort({ createdAt: -1 });

  res.status(200).json({ versions });
});

/**
 * GET /api/versions/file/:fileId
 * Streams the actual file back for download/preview.
 * Access is checked via the Version document's parent repo.
 */
exports.getVersionFile = asyncHandler(async (req, res) => {
  const version = await Version.findOne({ fileId: req.params.fileId }).populate("repo");
  if (!version) return res.status(404).json({ message: "File not found" });

  if (!assertRepoAccess(version.repo, req.user._id)) {
    return res.status(403).json({ message: "You don't have access to this file" });
  }

  res.set("Content-Disposition", `inline; filename="${version.fileName}"`);

  const stream = fileService.downloadStream(version.fileId);
  stream.on("error", () => res.status(404).json({ message: "File data not found in storage" }));
  stream.pipe(res);
});

/**
 * PATCH /api/versions/:id/link
 * Body: { derivedFrom: [versionIds] }
 * Replaces this version's MANUAL links; automatic links are kept.
 * Links that would cross repos or create a loop are reported in `rejected`.
 */
exports.linkVersion = asyncHandler(async (req, res) => {
  const ids = (req.body.derivedFrom || []).filter(mongoose.isValidObjectId);

  const version = await Version.findById(req.params.id).populate("repo");
  if (!version) return res.status(404).json({ message: "Version not found" });
  if (!assertRepoAccess(version.repo, req.user._id)) {
    return res.status(403).json({ message: "You don't have access to this version" });
  }

  version.derivedFrom = version.derivedFrom.filter((e) => e.source === "auto");
  await version.save();

  const rejected = [];
  for (const id of ids) {
    const ok = await lineageService.addEdge(version._id, id, "manual", "manual");
    if (!ok) rejected.push(id);
  }

  const fresh = await Version.findById(version._id);
  res.status(200).json({ version: fresh, rejected });
});