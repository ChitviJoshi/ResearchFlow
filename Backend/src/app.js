const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const repoRoutes = require("./routes/repo.routes");
const versionRoutes = require("./routes/version.routes");
const reviewRoutes = require("./routes/review.routes");
const userRoutes = require("./routes/user.routes");

const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/repos", repoRoutes);
app.use("/api/versions", versionRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);

app.use(errorMiddleware);

module.exports = app;
