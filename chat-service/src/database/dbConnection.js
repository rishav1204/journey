import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    mongoose.connection.on("connected", () => {
      logger.info(`MongoDB Connected: ${conn.connection.host}`);
    });

    mongoose.connection.on("error", (err) => {
      logger.error(`MongoDB Connection Error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB Disconnected. Attempting to reconnect...");
    });

    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed through app termination");
      process.exit(0);
    });

    return conn;
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
