// Verifies JWT from Authorization header, checks blacklist, attaches req.user
const tokenService = require("../services/token.service");
const User = require("../models/user.model");

/**
 * Auth middleware : protects private routes.
 * Expects an "Authorization: Bearer <token>" header.
 * On success, attaches the authenticated user to req.user and the raw token to req.token (needed later for logout/blacklisting).
 */
module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // No header, or wrong format -> reject immediately
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Reject tokens that were explicitly logged out, even if not expired
    const blacklisted = await tokenService.isTokenBlacklisted(token);
    if (blacklisted) {
      return res.status(401).json({ message: "Token has been invalidated, please log in again" });
    }

    // Verify signature/expiry, then look up the user it belongs to
    const decoded = tokenService.verifyToken(token);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    // Covers jwt.verify failures: malformed token, bad signature, expired
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
