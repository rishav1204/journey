import mongoose from "mongoose";

const channelSubscriptionSchema = new mongoose.Schema(
  {
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
      index: true,
    },
    subscriberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subscription: {
      type: {
        type: String,
        enum: ["free", "basic", "premium", "vip"],
        default: "free",
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      expiryDate: Date,
      autoRenew: {
        type: Boolean,
        default: false,
      },
      price: Number,
      currency: String,
      paymentHistory: [
        {
          amount: Number,
          currency: String,
          date: Date,
          status: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending",
          },
          transactionId: String,
        },
      ],
    },
    notifications: {
      preferences: {
        all: { type: Boolean, default: true },
        announcements: { type: Boolean, default: true },
        posts: { type: Boolean, default: true },
        polls: { type: Boolean, default: true },
        mentions: { type: Boolean, default: true },
        replies: { type: Boolean, default: true },
      },
      method: {
        inApp: { type: Boolean, default: true },
        email: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
      },
      schedule: {
        digest: {
          type: String,
          enum: ["none", "daily", "weekly"],
          default: "none",
        },
        quietHours: {
          enabled: Boolean,
          start: String,
          end: String,
        },
      },
      lastNotified: Date,
    },
    access: {
      level: {
        type: String,
        enum: ["read", "write", "moderate"],
        default: "read",
      },
      customPermissions: {
        canComment: { type: Boolean, default: true },
        canReact: { type: Boolean, default: true },
        canShare: { type: Boolean, default: true },
      },
      restrictions: [
        {
          type: String,
          reason: String,
          until: Date,
        },
      ],
    },
    engagement: {
      lastActive: Date,
      totalPosts: { type: Number, default: 0 },
      totalComments: { type: Number, default: 0 },
      totalReactions: { type: Number, default: 0 },
      engagementScore: { type: Number, default: 0 },
      interests: [String],
    },
    status: {
      current: {
        type: String,
        enum: ["active", "suspended", "blocked", "left"],
        default: "active",
      },
      history: [
        {
          status: String,
          reason: String,
          changedAt: Date,
        },
      ],
    },
    metadata: {
      joinSource: String,
      invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      notes: String,
      tags: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Compound Indexes
channelSubscriptionSchema.index(
  { channelId: 1, subscriberId: 1 },
  { unique: true }
);
channelSubscriptionSchema.index({ "subscription.expiryDate": 1 });
channelSubscriptionSchema.index({ "status.current": 1 });
channelSubscriptionSchema.index({ "engagement.lastActive": -1 });

// Pre-save middleware
channelSubscriptionSchema.pre("save", function (next) {
  if (this.isModified("engagement")) {
    // Calculate engagement score
    const { totalPosts, totalComments, totalReactions } = this.engagement;
    this.engagement.engagementScore =
      totalPosts * 3 + totalComments * 2 + totalReactions;
  }
  next();
});

const ChannelSubscription = mongoose.model(
  "ChannelSubscription",
  channelSubscriptionSchema
);

export default ChannelSubscription;
