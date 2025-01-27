import { promises as fs } from "fs";
import { existsSync, mkdirSync } from "fs"; // Add regular fs import
import path from "path";
import express from "express";
import connectDB from "./config/dbConnection.js";
import mongoose from "mongoose";
import "./models/User.js";
import dotenv from "dotenv";
dotenv.config();

// Connect to MongoDB
await connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create upload directory if it doesn't exist
const uploadDir = path.join(process.cwd(), "tmp", "uploads");
if (!existsSync(uploadDir)) {
  // Use sync version from regular fs
  mkdirSync(uploadDir, { recursive: true }); // Use sync version from regular fs
}

import feedRoutes from "./routes/feed/feedRoutes.js";
import blockRoutes from "./routes/interaction/blockRoutes.js";
import followRoutes from "./routes/interaction/followRoutes.js";
import followerRoutes from "./routes/interaction/followerRoutes.js";
import reportRoutes from "./routes/interaction/reportRoutes.js";
import postCommentRoutes from "./routes/post/postCommentRoutes.js";
import postRoutes from "./routes/post/postRoutes.js";
import postSaveRoutes from "./routes/post/postSaveRoutes.js";
import postShareRoutes from "./routes/post/postShareRoutes.js";
import profileRoutes from "./routes/profile/profileRoutes.js";
import searchRoutes from "./routes/search/searchRoutes.js";

// API Routes
app.use("/api/feed", feedRoutes);
app.use("/api/post", postRoutes);
app.use("/api/post/comments", postCommentRoutes)
app.use("/api/save/post", postSaveRoutes);
app.use("/api/share/post", postShareRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/follower", followerRoutes);
app.use("/api/block", blockRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/search", searchRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Something went wrong!",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

export default app;
