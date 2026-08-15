const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * User schema.
 * Represents both students and professors — the `role` field determines
 * what permissions and views they get across repos and review requests.
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // stored as a bcrypt hash, never plain text
    role: { type: String, enum: ["student", "professor"], required: true },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);


/**
 * Pre-save hook: hashes the password before it's written to the DB.
 * Only runs when the password field is new or has changed, so updating
 * other fields (like name) doesn't re-hash an already-hashed password.
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


/**
 * Instance method to check a plain-text password (from a login request)
 * against this user's stored hash. Returns true/false.
 */
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);