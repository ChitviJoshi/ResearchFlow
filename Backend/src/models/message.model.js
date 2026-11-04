const mongoose = require("mongoose");

/** One place the attached file was found in the repo. */
const matchSchema = new mongoose.Schema(
  {
    version: { type: mongoose.Schema.Types.ObjectId, ref: "Version", required: true },
    matchedAs: { type: String, enum: ["file", "inside"], required: true }, // the version itself, or inside a zip/notebook
    insidePath: { type: String },
  },
  { _id: false }
);

/**
 * What a message points at.
 * - "version": an item picked from the repo
 * - "file-check": a file from the sender's laptop, fingerprinted and compared to the repo (never stored)
 * An empty matches list on a file-check means "not found in this repo".
 */
const attachmentSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ["version", "file-check"], required: true },
    fileName: { type: String, required: true },
    contentHash: { type: String },
    matches: [matchSchema],
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    repo: { type: mongoose.Schema.Types.ObjectId, ref: "Repo", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, trim: true, maxlength: 2000 },
    reviewRequest: { type: mongoose.Schema.Types.ObjectId, ref: "ReviewRequest" }, // optional link
    attachment: attachmentSchema,
  },
  { timestamps: true }
);

messageSchema.index({ repo: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);