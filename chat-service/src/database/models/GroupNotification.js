import mongoose from "mongoose";

const groupNotificationSchema = new mongoose.Schema(
  {
    // Core Fields
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    recipients: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["pending", "delivered", "read", "failed"],
          default: "pending",
        },
        deliveredAt: Date,
        readAt: Date,
      },
    ],

    // Notification Content
    type: {
      type: String,
      enum: [
        "new_message",
        "member_joined",
        "member_left",
        "member_removed",
        "member_role_changed",
        "poll_created",
        "poll_ended",
        "message_pinned",
        "message_deleted",
        "settings_changed",
        "group_archived",
        "mention",
        "reply",
      ],
      required: true,
    },
    category: {
      type: String,
      enum: ["activity", "moderation", "system", "mention"],
      default: "activity",
    },
    content: {
      message: String,
      messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
      data: mongoose.Schema.Types.Mixed,
    },

    // Notification Settings
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    delivery: {
      channels: [
        {
          type: String,
          enum: ["in_app", "push", "email", "sms"],
          status: String,
        },
      ],
      attempts: [
        {
          channel: String,
          timestamp: Date,
          status: String,
          error: String,
        },
      ],
    },

    // Status & Expiry
    status: {
      type: String,
      enum: ["queued", "sent", "failed", "cancelled"],
      default: "queued",
    },
    expiresAt: Date,

    // Action Tracking
    actions: [
      {
        type: {
          type: String,
          enum: ["view", "click", "dismiss", "respond"],
        },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: Date,
        data: mongoose.Schema.Types.Mixed,
      },
    ],

    // Analytics
    metrics: {
      viewCount: { type: Number, default: 0 },
      clickCount: { type: Number, default: 0 },
      dismissCount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
groupNotificationSchema.index({ groupId: 1, type: 1 });
groupNotificationSchema.index({ "recipients.userId": 1, createdAt: -1 });
groupNotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware
groupNotificationSchema.pre("save", function (next) {
  if (!this.expiresAt) {
    // Default expiry of 30 days
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

const GroupNotification = mongoose.model(
  "GroupNotification",
  groupNotificationSchema
);

export default GroupNotification;
