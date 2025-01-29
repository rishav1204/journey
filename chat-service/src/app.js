// src/app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import logger from "./utils/logger.js";


// Import Routes
import messageRoutes from "./routes/messageRoutes.js";
import groupChatRoutes from "./routes/groupChatRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import callRoutes from "./routes/callRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import channelRoutes from "./routes/channelRoutes.js";
import privacyRoutes from "./routes/privacyRoutes.js";
import userSettingRoutes from "./routes/userSettingRoutes.js";

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Request logging middleware
app.use((req, res, next) => {
  info(`${req.method} ${req.url}`);
  next();
});

// API Routes
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupChatRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/privacy", privacyRoutes);
app.use("/api/settings", userSettingRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "chat-service",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.info(`Error: ${err.stack}`);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Graceful shutdown helper
const shutdown = () => {
  logger.info("Shutting down HTTP server");
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export default app;
