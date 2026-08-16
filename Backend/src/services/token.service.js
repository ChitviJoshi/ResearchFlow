// generateToken, verifyToken, blacklistToken helpers
const jwt = require("jsonwebtoken");
const Blacklist = require("../models/blacklist.model");

/**
 * Creates a signed JWT for a given user, containing their id and role.
 * This token is what the frontend stores and sends back on every authenticated request (as an Authorization: Bearer header).
 */
exports.generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

/**
 * Verifies a token's signature and expiry.
 * Throws if the token is invalid/expired : caller is expected to catch it.
 */
exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Adds a token to the blacklist on logout, so it can no longer be used
 * even though it hasn't naturally expired yet (JWTs can't be "revoked" directly, so we track invalidated ones separately).
 */
exports.blacklistToken = async (token) => {
  const decoded = jwt.decode(token);
  const expiresAt = decoded?.exp
    ? new Date(decoded.exp * 1000)
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await Blacklist.create({ token, expiresAt });
};

/**
 * Checks whether a token has been blacklisted (logged out) already.
 * Used by the auth middleware before trusting an otherwise-valid token.
 */
exports.isTokenBlacklisted = async (token) => {
  const found = await Blacklist.findOne({ token });
  return !!found;
};