import mongoose from "mongoose";

const blockStatusSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blockedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      maxLength: 500,
    },
    blockType: {
      type: String,
      enum: ["full", "partial", "temporary"],
      default: "full",
    },
    restrictions: {
      preventMessages: { type: Boolean, default: true },
      preventGroupInteraction: { type: Boolean, default: true },
      preventProfileView: { type: Boolean, default: true },
      preventStoryView: { type: Boolean, default: true },
    },
    blockedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: Date,
    status: {
      type: String,
      enum: ["active", "expired", "removed"],
      default: "active",
    },
    metadata: {
      deviceInfo: String,
      ipAddress: String,
      location: String,
    },
    history: [
      {
        action: {
          type: String,
          enum: ["created", "modified", "expired", "removed"],
        },
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  {
    timestamps: true,
    // Ensure unique combination of userId and blockedUser
    index: {
      userId: 1,
      blockedUser: 1,
    },
    unique: true,
  }
);

// Indexes for efficient queries
blockStatusSchema.index({ userId: 1, status: 1 });
blockStatusSchema.index({ blockedUser: 1, status: 1 });
blockStatusSchema.index({ expiresAt: 1 }, { sparse: true });

// Prevent self-blocking
blockStatusSchema.pre("save", function (next) {
  if (this.userId.toString() === this.blockedUser.toString()) {
    next(new Error("Users cannot block themselves"));
  }
  next();
});

const BlockStatus = mongoose.model("BlockStatus", blockStatusSchema);

export default BlockStatus;
