const mongoose = require("mongoose");

// A single round in the review thread: a version + who uploaded it (student or professor)
const reviewEntrySchema = new mongoose.Schema(
  {
    version: { type: mongoose.Schema.Types.ObjectId, ref: "Version", required: true },
    uploadedByRole: { type: String, enum: ["student", "professor"], required: true },
    comment: { type: String },
  },
  { timestamps: true }
);

const reviewRequestSchema = new mongoose.Schema(
  {
    repo: { type: mongoose.Schema.Types.ObjectId, ref: "Repo", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    professor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["open", "approved", "changes_requested"], default: "open" },
    thread: [reviewEntrySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReviewRequest", reviewRequestSchema);
