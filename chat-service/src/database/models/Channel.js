import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["news", "entertainment", "education", "business", "other"],
    },

    // Channel Configuration
    type: {
      type: String,
      enum: ["public", "private", "restricted"],
      default: "public",
    },
    contentType: {
      type: String,
      enum: ["broadcast", "interactive", "announcement"],
      default: "broadcast",
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["owner", "admin", "moderator", "subscriber"],
          default: "subscriber",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        permissions: {
          canPost: { type: Boolean, default: false },
          canModerate: { type: Boolean, default: false },
          canInvite: { type: Boolean, default: false },
        },
        notifications: {
          enabled: { type: Boolean, default: true },
          types: {
            posts: { type: Boolean, default: true },
            comments: { type: Boolean, default: true },
            mentions: { type: Boolean, default: true },
          },
          lastRead: Date,
        },
      },
    ],

    // Content Settings
    settings: {
      posting: {
        subscriberPosting: { type: Boolean, default: false },
        allowReplies: { type: Boolean, default: true },
        slowMode: { type: Number, default: 0 },
        approvalRequired: { type: Boolean, default: false },
        allowedContentTypes: [
          {
            type: String,
            enum: ["text", "image", "video", "poll", "file"],
          },
        ],
      },
      moderation: {
        autoModeration: { type: Boolean, default: false },
        restrictedWords: [String],
        memberVerification: { type: Boolean, default: false },
      },
      privacy: {
        isPrivate: { type: Boolean, default: false },
        joinRequiresApproval: { type: Boolean, default: false },
        memberListVisibility: {
          type: String,
          enum: ["public", "members", "admins"],
          default: "public",
        },
      },
    },

    // Analytics & Stats
    stats: {
      subscriberCount: { type: Number, default: 0 },
      messageCount: { type: Number, default: 0 },
      activeMembers: { type: Number, default: 0 },
      engagement: {
        dailyActiveUsers: { type: Number, default: 0 },
        weeklyActiveUsers: { type: Number, default: 0 },
        averageReactions: { type: Number, default: 0 },
      },
      lastActivityAt: Date,
    },

    // Channel Features
    features: {
      isVerified: { type: Boolean, default: false },
      isPremium: { type: Boolean, default: false },
      customization: {
        avatar: String,
        banner: String,
        theme: {
          primaryColor: String,
          secondaryColor: String,
        },
      },
    },

    // Related Entities
    linkedGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    pinnedMessages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Indexes
channelSchema.index({ name: 1 });
channelSchema.index({ "members.userId": 1 });
channelSchema.index({ type: 1, createdAt: -1 });
channelSchema.index({ tags: 1 });

// Validations
channelSchema.pre("save", function (next) {
  // Update stats
  if (this.isModified("members")) {
    this.stats.subscriberCount = this.members.length;
  }
  next();
});

const Channel = mongoose.model("Channel", channelSchema);

export default Channel;
