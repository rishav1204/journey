import mongoose from "mongoose";

const blockSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate blocks
blockSchema.index({ userId: 1, blockedBy: 1 }, { unique: true });

const Block = mongoose.model("Block", blockSchema);

export default Block;

