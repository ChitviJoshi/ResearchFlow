const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const fileMiddleware = require("../middlewares/file.middleware");

router.get("/:repoId", authMiddleware, messageController.getMessages);
router.post("/:repoId", authMiddleware, fileMiddleware, messageController.postMessage);

module.exports = router;