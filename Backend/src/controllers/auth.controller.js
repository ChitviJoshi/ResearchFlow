// signup, login, logout (blacklist token), getCurrentUser
const User = require("../models/user.model");
const tokenService = require("../services/token.service");
const asyncHandler = require("../utils/asyncHandler");

/**
 * POST /api/auth/signup
 * Creates a new user (student or professor) and returns a JWT so they're immediately logged in after registering.
 */
exports.signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (!["student", "professor"].includes(role)) {
    return res.status(400).json({ message: "Role must be student or professor" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "Email already registered" });
  }

  // Password gets hashed automatically by the pre-save hook on the model
  const user = await User.create({ name, email, password, role });
  const token = tokenService.generateToken(user);

  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

/**
 * POST /api/auth/login
 * Verifies email + password, returns a fresh JWT on success.
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    // Deliberately vague, don't reveal whether the email exists or not
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = tokenService.generateToken(user);

  res.status(200).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

/**
 * POST /api/auth/logout
 * Blacklists the current token so it can't be reused, even before it expires.
 * Requires auth middleware to have already run (needs req.token).
 */
exports.logout = asyncHandler(async (req, res) => {
  await tokenService.blacklistToken(req.token);
  res.status(200).json({ message: "Logged out successfully" });
});

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 * Requires auth middleware to have already run (needs req.user).
 */
exports.getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ user: req.user });
});