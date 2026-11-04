const mongoose = require("mongoose");
const Message = require("../models/message.model");
const Repo = require("../models/repo.model");
const Version = require("../models/version.model");
const ReviewRequest = require("../models/reviewRequest.model");
const fingerprintService = require("../services/fingerprint.service");
const lineageService = require("../services/lineage.service");
const asyncHandler = require("../utils/asyncHandler");

const MAX_BODY = 2000;

/** Access check: user must be the repo's owner or a collaborator */
const assertRepoAccess = (repo, userId) => {
  const isOwner = repo.owner.equals(userId);
  const isCollaborator = repo.collaborators.some((c) => c.user.equals(userId));
  return isOwner || isCollaborator;
};

/** Fills in sender, linked review and the versions an attachment points at. */
const populateMessage = (query) =>
  query
    .populate("sender", "name role")
    .populate("reviewRequest", "status")
    .populate("attachment.matches.version", "type versionNumber fileName createdAt");

/**
 * GET /api/messages/:repoId
 * The latest 200 messages of a repo's discussion, oldest first.
 */
exports.getMessages = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.repoId)) {
    return res.status(404).json({ message: "Repo not found" });
  }
  const repo = await Repo.findById(req.params.repoId);
  if (!repo) return res.status(404).json({ message: "Repo not found" });
  if (!assertRepoAccess(repo, req.user._id)) {
    return res.status(403).json({ message: "You don't have access to this repo" });
  }

  const messages = await populateMessage(
    Message.find({ repo: repo._id }).sort({ createdAt: -1 }).limit(200)
  );
  messages.reverse();

  res.status(200).json({ messages });
});

/**
 * POST /api/messages/:repoId
 * form-data (or JSON): body?, file?, versionId?, reviewRequestId?
 * - file: a file from the sender's laptop. It is fingerprinted and compared
 *   with the repo, then thrown away; nothing is stored.
 * - versionId: attach an item that already exists in the repo.
 * Send a file OR a versionId, not both. At least one of body/file/versionId is required.
 */
exports.postMessage = asyncHandler(async (req, res) => {
  const { repoId } = req.params;
  if (!mongoose.isValidObjectId(repoId)) {
    return res.status(404).json({ message: "Repo not found" });
  }
  const repo = await Repo.findById(repoId);
  if (!repo) return res.status(404).json({ message: "Repo not found" });
  if (!assertRepoAccess(repo, req.user._id)) {
    return res.status(403).json({ message: "You don't have access to this repo" });
  }

  const fields = req.body || {};
  const body = (fields.body || "").trim();
  const { versionId, reviewRequestId } = fields;

  if (!body && !req.file && !versionId) {
    return res.status(400).json({ message: "Write a message or attach something" });
  }
  if (body.length > MAX_BODY) {
    return res.status(400).json({ message: `Messages are limited to ${MAX_BODY} characters` });
  }
  if (req.file && versionId) {
    return res.status(400).json({ message: "Attach a file to check or a version from the repo, not both" });
  }

  // Optional link to one of this repo's review requests
  let reviewRequest = null;
  if (reviewRequestId) {
    if (!mongoose.isValidObjectId(reviewRequestId)) {
      return res.status(400).json({ message: "Invalid review request" });
    }
    reviewRequest = await ReviewRequest.findOne({ _id: reviewRequestId, repo: repo._id });
    if (!reviewRequest) {
      return res.status(400).json({ message: "That review request is not part of this repo" });
    }
  }

  let attachment;
  if (req.file) {
    const hash = fingerprintService.hashBuffer(req.file.buffer);
    const found = await lineageService.findMatches(repo._id, hash);
    // the version that IS the file first, then the zips/notebooks that contain it
    found.sort((a, b) => (a.matchedAs === "file" ? 0 : 1) - (b.matchedAs === "file" ? 0 : 1));
    attachment = {
      kind: "file-check",
      fileName: req.file.originalname,
      contentHash: hash,
      matches: found.map((m) => ({ version: m._id, matchedAs: m.matchedAs, insidePath: m.insidePath })),
    };
  } else if (versionId) {
    if (!mongoose.isValidObjectId(versionId)) {
      return res.status(400).json({ message: "Invalid version" });
    }
    const version = await Version.findOne({ _id: versionId, repo: repo._id });
    if (!version) return res.status(404).json({ message: "Version not found in this repo" });
    attachment = {
      kind: "version",
      fileName: version.fileName,
      contentHash: version.contentHash,
      matches: [{ version: version._id, matchedAs: "file" }],
    };
  }

  const message = await Message.create({
    repo: repo._id,
    sender: req.user._id,
    body,
    reviewRequest: reviewRequest ? reviewRequest._id : undefined,
    attachment,
  });

  const saved = await populateMessage(Message.findById(message._id));
  res.status(201).json({ message: saved });
});