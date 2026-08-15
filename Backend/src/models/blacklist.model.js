const mongoose = require("mongoose");

// Blacklisted JWTs for logout invalidation
const blacklistSchema = new mongoose.Schema(
  {
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blacklist", blacklistSchema);
