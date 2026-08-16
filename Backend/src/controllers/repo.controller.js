// createRepo, getMyRepos, getRepoById, addCollaborator, deleteRepo
const Repo = require("../models/repo.model");
const User = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler");

/**
 * POST /api/repos
 * Creates a new repo owned by the logged-in user.
 */
exports.createRepo = asyncHandler(async (req, res) => {
  const { name, description, isPrivate } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Repo name is required" });
  }

  const repo = await Repo.create({
    name,
    description,
    owner: req.user._id,
    isPrivate: isPrivate !== undefined ? isPrivate : true,
  });

  res.status(201).json({ repo });
});

/**
 * GET /api/repos
 * Returns every repo the logged-in user can see:
 * ones they own, plus ones they've been added to as a collaborator
 * (e.g. a professor added to a student's repo for review).
 */
exports.getMyRepos = asyncHandler(async (req, res) => {
  const repos = await Repo.find({
    $or: [{ owner: req.user._id }, { "collaborators.user": req.user._id }],
  })
    .populate("owner", "name email role")
    .sort({ updatedAt: -1 });

  res.status(200).json({ repos });
});

/**
 * GET /api/repos/:id
 * Returns a single repo's details, only if the requester is the owner or a collaborator on it.
 */
exports.getRepoById = asyncHandler(async (req, res) => {
  const repo = await Repo.findById(req.params.id)
    .populate("owner", "name email role")
    .populate("collaborators.user", "name email role");

  if (!repo) {
    return res.status(404).json({ message: "Repo not found" });
  }

  const isOwner = repo.owner._id.equals(req.user._id);
  const isCollaborator = repo.collaborators.some((c) => c.user._id.equals(req.user._id));

  if (!isOwner && !isCollaborator) {
    return res.status(403).json({ message: "You don't have access to this repo" });
  }

  res.status(200).json({ repo });
});

/**
 * POST /api/repos/:id/collaborators
 * Adds a collaborator (e.g. a professor) to a repo by their email.
 * Only the repo owner can add collaborators.
 */
exports.addCollaborator = asyncHandler(async (req, res) => {
  const { email, role } = req.body;

  const repo = await Repo.findById(req.params.id);
  if (!repo) {
    return res.status(404).json({ message: "Repo not found" });
  }

  if (!repo.owner.equals(req.user._id)) {
    return res.status(403).json({ message: "Only the repo owner can add collaborators" });
  }

  const collaboratorUser = await User.findOne({ email });
  if (!collaboratorUser) {
    return res.status(404).json({ message: "No user found with that email" });
  }

  const alreadyAdded = repo.collaborators.some((c) => c.user.equals(collaboratorUser._id));
  if (alreadyAdded) {
    return res.status(409).json({ message: "This user is already a collaborator" });
  }

  repo.collaborators.push({ user: collaboratorUser._id, role: role || "supervisor" });
  await repo.save();

  res.status(200).json({ repo });
});

/**
 * DELETE /api/repos/:id
 * Deletes a repo. Only the owner can delete it.
 */
exports.deleteRepo = asyncHandler(async (req, res) => {
  const repo = await Repo.findById(req.params.id);
  if (!repo) {
    return res.status(404).json({ message: "Repo not found" });
  }

  if (!repo.owner.equals(req.user._id)) {
    return res.status(403).json({ message: "Only the repo owner can delete this repo" });
  }

  await repo.deleteOne();
  res.status(200).json({ message: "Repo deleted" });
});