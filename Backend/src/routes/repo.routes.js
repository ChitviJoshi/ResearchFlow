const express = require("express");
const router = express.Router();
const repoController = require("../controllers/repo.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/", authMiddleware, repoController.createRepo);
router.get("/", authMiddleware, repoController.getMyRepos);
router.get("/:id", authMiddleware, repoController.getRepoById);
router.post("/:id/collaborators", authMiddleware, repoController.addCollaborator);
router.delete("/:id", authMiddleware, repoController.deleteRepo);

module.exports = router;
