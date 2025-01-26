import mongoose from "mongoose";
import Post from "../models/Post.js";
import Save from "../models/Save.js";
import Comment from "../models/Comment.js";
import Block from "../models/block.js";
import Report from "../models/Report.js";
import Share from "../models/Share.js";
import Like from "../models/Like.js";

// Import User model schema from user service
import userSchema from "../../../user-service/src/database/models/User.js";

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 50,
      wtimeout: 30000,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    // Register User model if it hasn't been registered
    if (!mongoose.models.User) {
      mongoose.model("User", userSchema);
    }

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
