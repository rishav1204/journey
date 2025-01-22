import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Links to the User model
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["emailVerification", "passwordReset", "refreshToken"], // Different types of tokens
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Tokens automatically expire after 1 hour (you can adjust this)
  },
});

const Token = mongoose.model("Token", tokenSchema);

export default Token;
