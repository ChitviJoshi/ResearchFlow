const mongoose = require("mongoose");

/** One item found *inside* an uploaded file: a zip entry or an image embedded in a notebook output. */
const artifactSchema = new mongoose.Schema(
  {
    path: { type: String, required: true }, // e.g. "results/fig1.png" or "cell 4 output 0 (image/png)"
    sha256: { type: String, required: true },
    size: { type: Number, required: true },
    origin: { type: String, enum: ["zip-entry", "notebook-output"], required: true },
  },
  { _id: false }
);

/** A lineage edge meaning "this version was derived from `version`". */
const derivedFromSchema = new mongoose.Schema(
  {
    version: { type: mongoose.Schema.Types.ObjectId, ref: "Version", required: true },
    source: { type: String, enum: ["manual", "auto"], default: "manual" },
    reason: { type: String }, // why the link exists, shown in the UI
  },
  { _id: false }
);

const versionSchema = new mongoose.Schema(
  {
    repo: { type: mongoose.Schema.Types.ObjectId, ref: "Repo", required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["paper", "dataset", "experiment", "result"], required: true },
    versionNumber: { type: Number, required: true },
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true }, // GridFS file ref
    fileName: { type: String, required: true },
    contentHash: { type: String }, // SHA-256 of the whole file (absent on pre-feature versions)
    artifacts: [artifactSchema], // fingerprints of items inside zips / notebooks
    derivedFrom: [derivedFromSchema], // lineage: what this version was produced from
    notes: { type: String },
  },
  { timestamps: true }
);

versionSchema.index({ repo: 1, contentHash: 1 });
versionSchema.index({ repo: 1, "artifacts.sha256": 1 });
versionSchema.index({ "derivedFrom.version": 1 }); // makes "what was derived from this?" fast

module.exports = mongoose.model("Version", versionSchema);