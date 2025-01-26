import pkg from "mongoose";
import { info, error, warn } from "../utils/errorLogger.js";

const { connect, connection } = pkg;

const connectDB = async () => {
  try {
    const conn = await connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    });

    info(`MongoDB Connected: ${conn.connection.host}`);

    connection.on("connected", () => {
      info("Mongoose connected to MongoDB");
    });

    connection.on("error", (err) => {
      error(`MongoDB connection error: ${err}`);
    });

    connection.on("disconnected", () => {
      warn("MongoDB connection disconnected");
    });

    process.on("SIGINT", async () => {
      await connection.close();
      info("MongoDB connection closed through app termination");
      process.exit(0);
    });
  } catch (err) {
    error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
