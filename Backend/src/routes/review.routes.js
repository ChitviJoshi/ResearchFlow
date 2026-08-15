const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const fileMiddleware = require("../middlewares/file.middleware");

router.post("/:repoId", authMiddleware, reviewController.createReviewRequest);
router.post("/:id/thread", authMiddleware, fileMiddleware, reviewController.addThreadEntry);
router.patch("/:id/status", authMiddleware, reviewController.updateStatus);
router.get("/repo/:repoId", authMiddleware, reviewController.getReviewsByRepo);
router.get("/:id", authMiddleware, reviewController.getReviewById);

module.exports = router;
