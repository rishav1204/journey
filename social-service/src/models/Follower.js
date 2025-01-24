import mongoose from "mongoose";

const followerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    followingUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    followedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate follows
followerSchema.index({ userId: 1, followingUserId: 1 }, { unique: true });

const Follower = mongoose.model("Follower", followerSchema);

export default Follower;
