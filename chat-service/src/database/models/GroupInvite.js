// models/GroupInvite.js
import mongoose from "mongoose";

const groupInviteSchema = new mongoose.Schema(
  {
    // Core Fields
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    invitedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Invite Status
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "expired", "cancelled"],
      default: "pending",
    },

    // Time Management
    expiresAt: {
      type: Date,
      required: true,
    },
    respondedAt: Date,

    // Additional Fields
    inviteType: {
      type: String,
      enum: ["direct", "link", "email"],
      default: "direct",
    },
    inviteLink: {
      code: String,
      maxUses: Number,
      usedCount: { type: Number, default: 0 },
    },
    role: {
      type: String,
      enum: ["admin", "moderator", "member"],
      default: "member",
    },
    message: String,
    metadata: {
      source: String, // Where the invite was generated (web, mobile, etc.)
      ipAddress: String,
      userAgent: String,
    },
    notifications: [
      {
        type: String,
        sentAt: Date,
        status: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
groupInviteSchema.index({ createdAt: -1 });
groupInviteSchema.index({ expiresAt: 1 });
groupInviteSchema.index(
  {
    groupId: 1,
    invitedUser: 1,
  },
  {
    unique: true,
    partialFilterExpression: { status: "pending" },
  }
);

// Pre-save middleware
groupInviteSchema.pre("save", function (next) {
  if (!this.expiresAt) {
    // Default expiry of 7 days if not specified
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Methods
groupInviteSchema.methods.accept = async function () {
  this.status = "accepted";
  this.respondedAt = new Date();
  await this.save();
};

groupInviteSchema.methods.reject = async function () {
  this.status = "rejected";
  this.respondedAt = new Date();
  await this.save();
};

const GroupInvite = mongoose.model("GroupInvite", groupInviteSchema);

export default GroupInvite;
