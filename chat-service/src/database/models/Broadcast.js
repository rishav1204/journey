import mongoose from "mongoose";

const broadcastSchema = new mongoose.Schema(
  {
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxLength: 5000,
    },
    messageType: {
      type: String,
      enum: ["text", "media", "poll", "announcement", "event", "alert"],
      default: "text",
    },
    media: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Media",
      },
    ],
    status: {
      type: String,
      enum: ["draft", "scheduled", "sending", "sent", "failed", "cancelled"],
      default: "draft",
    },
    targeting: {
      audience: {
        type: String,
        enum: ["all", "subscribers", "premium", "custom"],
        default: "all",
      },
      filters: {
        countries: [String],
        languages: [String],
        userGroups: [
          { type: mongoose.Schema.Types.ObjectId, ref: "UserGroup" },
        ],
        subscriptionLevel: String,
      },
    },
    scheduling: {
      isScheduled: { type: Boolean, default: false },
      scheduledFor: Date,
      timezone: String,
      recurrence: {
        pattern: String,
        endDate: Date,
      },
    },
    stats: {
      viewCount: { type: Number, default: 0 },
      reactionCount: { type: Number, default: 0 },
      clickCount: { type: Number, default: 0 },
      shareCount: { type: Number, default: 0 },
      engagementRate: Number,
      uniqueViewers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    deliveryStatus: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["queued", "sent", "delivered", "read", "failed"],
          default: "queued",
        },
        timestamp: Date,
        error: String,
      },
    ],
    settings: {
      isPinned: { type: Boolean, default: false },
      allowReactions: { type: Boolean, default: true },
      allowComments: { type: Boolean, default: true },
      allowSharing: { type: Boolean, default: true },
      priority: {
        type: String,
        enum: ["low", "normal", "high", "urgent"],
        default: "normal",
      },
    },
    metadata: {
      links: [
        {
          url: String,
          title: String,
          clicks: { type: Number, default: 0 },
        },
      ],
      attachments: [
        {
          type: String,
          url: String,
          size: Number,
        },
      ],
      tags: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
broadcastSchema.index({ channelId: 1, createdAt: -1 });
broadcastSchema.index({ senderId: 1 });
broadcastSchema.index({ "scheduling.scheduledFor": 1 });
broadcastSchema.index({ status: 1 });
broadcastSchema.index({ "targeting.audience": 1 });

// Validation
broadcastSchema.pre("save", function (next) {
  if (this.scheduling.isScheduled && !this.scheduling.scheduledFor) {
    next(new Error("Scheduled broadcasts must have a scheduledFor date"));
  }
  next();
});

const Broadcast = mongoose.model("Broadcast", broadcastSchema);

export default Broadcast;
