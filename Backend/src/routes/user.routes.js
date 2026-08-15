const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/search", authMiddleware, userController.searchUsers);
router.get("/:id", authMiddleware, userController.getUserProfile);

module.exports = router;
