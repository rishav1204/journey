import app from "./src/app.js";
import connectDB from "./src/database/dbConnection.js";
import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  logger.info(`User connected: ${socket.id}`);

  // Join a conversation
  socket.on("join_conversation", (conversationId) => {
    socket.join(`conversation:${conversationId}`);
    logger.info(`User ${socket.id} joined conversation ${conversationId}`);
  });

  // Leave a conversation
  socket.on("leave_conversation", (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
    logger.info(`User ${socket.id} left conversation ${conversationId}`);
  });

  // Disconnect handler
  socket.on("disconnect", () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    logger.info("Connected to MongoDB");

    httpServer.listen(PORT, () => {
      logger.info(`Chat server running on port ${PORT}`);
    });

    // Graceful shutdown handlers
    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);

  } catch (err) {
    logger.error(`Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  }
};


// Graceful shutdown function
const gracefulShutdown = async () => {
  logger.info("Received shutdown signal");

  try {
    // Close Socket.IO connections
    io.close(() => {
      logger.info("Socket.IO server closed");
    });

    // Close HTTP server
    httpServer.close(() => {
      logger.info("HTTP server closed");
    });

    // Close MongoDB connection
    await mongoose.connection.close();
    logger.info("MongoDB connection closed");

    process.exit(0);
  } catch (err) {
    logger.error(`Error during shutdown: ${err.message}`);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.stack}`);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Promise Rejection: ${err.stack}`);
  process.exit(1);
});

// Start the server
startServer();