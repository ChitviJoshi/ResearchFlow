const mongoose = require("mongoose");

const repoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    collaborators: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["supervisor", "viewer"], default: "supervisor" },
      },
    ],
    isPrivate: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Repo", repoSchema);
