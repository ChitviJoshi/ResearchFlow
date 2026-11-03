const mongoose = require("mongoose");
const Version = require("../models/version.model");

const oid = (id) => new mongoose.Types.ObjectId(String(id));

/** Ids of everything `versionId` was (transitively) derived from, within one repo. */
const ancestorIds = async (versionId, repoId) => {
  const [doc] = await Version.aggregate([
    { $match: { _id: oid(versionId) } },
    {
      $graphLookup: {
        from: Version.collection.name,
        startWith: "$derivedFrom.version",
        connectFromField: "derivedFrom.version",
        connectToField: "_id",
        as: "ancestors",
        maxDepth: 25,
        restrictSearchWithMatch: { repo: oid(repoId) },
      },
    },
    { $project: { "ancestors._id": 1 } },
  ]);
  return (doc?.ancestors || []).map((a) => String(a._id));
};

/**
 * Adds "child was derived from parent". Returns false (and changes nothing) if
 * the link is a self-link, crosses repos, already exists, or would create a loop.
 */
exports.addEdge = async (childId, parentId, source, reason) => {
  if (String(childId) === String(parentId)) return false;

  const [child, parent] = await Promise.all([Version.findById(childId), Version.findById(parentId)]);
  if (!child || !parent || !child.repo.equals(parent.repo)) return false;
  if (child.derivedFrom.some((e) => e.version.equals(parent._id))) return false;

  // Loop guard: if child is already an ancestor of parent, this edge would close a cycle
  const parentAncestors = await ancestorIds(parent._id, parent.repo);
  if (parentAncestors.includes(String(child._id))) return false;

  child.derivedFrom.push({ version: parent._id, source, reason });
  await child.save();
  return true;
};

/**
 * Creates automatic lineage links for a freshly uploaded version.
 * Links are metadata only: no stored file is ever modified.
 * Returns the links created, so the upload response can show them.
 */
exports.autoLink = async (version, notebook) => {
  const links = [];
  const link = async (child, parent, reason) => {
    if (await exports.addEdge(child, parent, "auto", reason)) {
      links.push({ version: child, derivedFrom: parent, reason });
    }
  };

  // 1) This file already appears inside an existing notebook/zip, so it came from there
  if (version.contentHash) {
    const containers = await Version.find({
      repo: version.repo,
      _id: { $ne: version._id },
      "artifacts.sha256": version.contentHash,
    }).select("artifacts");

    for (const container of containers) {
      const hit = container.artifacts.find((a) => a.sha256 === version.contentHash);
      await link(version._id, container._id, hit.origin === "zip-entry" ? "zip-contains" : "notebook-output-hash");
    }
  }

  // 2) This upload is a zip/notebook, so existing versions identical to something inside it came from it
  if (version.artifacts.length) {
    const originByHash = new Map(version.artifacts.map((a) => [a.sha256, a.origin]));
    const children = await Version.find({
      repo: version.repo,
      _id: { $ne: version._id },
      contentHash: { $in: [...originByHash.keys()] },
    }).select("contentHash");

    for (const child of children) {
      const reason = originByHash.get(child.contentHash) === "zip-entry" ? "zip-contains" : "notebook-output-hash";
      await link(child._id, version._id, reason);
    }
  }

  // 3) Notebook code mentions files by name: inputs it reads, outputs it writes
  if (notebook) {
    for (const name of notebook.inputFiles) {
      const input = await Version.findOne({ repo: version.repo, _id: { $ne: version._id }, fileName: name })
        .sort({ createdAt: -1 })
        .select("_id");
      if (input) await link(version._id, input._id, "notebook-input-filename");
    }
    for (const name of notebook.outputFiles) {
      // Only claim outputs that don't already have a known origin
      const produced = await Version.find({
        repo: version.repo,
        _id: { $ne: version._id },
        fileName: name,
        "derivedFrom.0": { $exists: false },
      }).select("_id");
      for (const p of produced) await link(p._id, version._id, "notebook-output-filename");
    }
  }

  return links;
};

/** Every version in the repo that is, or contains, a file with this hash. */
exports.findMatches = async (repoId, hash) => {
  const versions = await Version.find({
    repo: repoId,
    $or: [{ contentHash: hash }, { "artifacts.sha256": hash }],
  })
    .populate("uploadedBy", "name role")
    .sort({ createdAt: -1 })
    .lean();

  return versions.map((v) => {
    const inside = v.contentHash === hash ? null : v.artifacts.find((a) => a.sha256 === hash);
    return { ...v, artifacts: undefined, matchedAs: inside ? "inside" : "file", insidePath: inside?.path };
  });
};