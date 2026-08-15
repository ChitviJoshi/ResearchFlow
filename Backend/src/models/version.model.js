const mongoose = require("mongoose");

const versionSchema = new mongoose.Schema(
  {
    repo: { type: mongoose.Schema.Types.ObjectId, ref: "Repo", required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["paper", "dataset", "experiment", "result"], required: true },
    versionNumber: { type: Number, required: true },
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true }, // GridFS file ref
    fileName: { type: String, required: true },
    linkedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "Version" }], // traceability e.g. result <- dataset/script
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Version", versionSchema);
