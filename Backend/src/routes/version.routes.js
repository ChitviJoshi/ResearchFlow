const express = require("express");
const router = express.Router();
const versionController = require("../controllers/version.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const fileMiddleware = require("../middlewares/file.middleware");

router.post("/:repoId", authMiddleware, fileMiddleware, versionController.uploadVersion);
router.get("/:repoId", authMiddleware, versionController.getVersionsByRepo);
router.get("/file/:fileId", authMiddleware, versionController.getVersionFile);
router.patch("/:id/link", authMiddleware, versionController.linkVersion);

module.exports = router;
