import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    // Basic Group Info
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
    type: {
      type: String,
      enum: ["public", "private", "secret"],
      default: "public",
    },
    category: {
      type: String,
      enum: ["general", "work", "education", "entertainment", "other"],
    },

    // Branding
    branding: {
      avatar: String,
      cover: String,
      theme: {
        color: String,
        background: String,
        emoji: String,
      },
      customization: {
        welcomeMessage: String,
        joinButton: String,
      },
    },

    // Member Management
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["owner", "admin", "moderator", "member"],
          default: "member",
        },
        status: {
          type: String,
          enum: ["active", "muted", "restricted", "banned"],
          default: "active",
        },
        joinInfo: {
          joinedAt: { type: Date, default: Date.now },
          addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          inviteLink: String,
        },
        permissions: {
          sendMessages: { type: Boolean, default: true },
          sendMedia: { type: Boolean, default: true },
          addMembers: { type: Boolean, default: false },
          removeMembers: { type: Boolean, default: false },
          createPolls: { type: Boolean, default: true },
          pinMessages: { type: Boolean, default: false },
          manageSettings: { type: Boolean, default: false },
        },
        restrictions: {
          mutedUntil: Date,
          restrictedUntil: Date,
          restrictionReason: String,
        },
      },
    ],

    // Group Settings
    settings: {
      privacy: {
        isPrivate: { type: Boolean, default: false },
        isEncrypted: { type: Boolean, default: true },
        encryptionType: String,
      },
      permissions: {
        onlyAdminsInvite: { type: Boolean, default: false },
        onlyAdminsMessage: { type: Boolean, default: false },
        onlyAdminsCreatePolls: { type: Boolean, default: false },
        allowMembershipRequests: { type: Boolean, default: true },
      },
      messages: {
        disappearingMessages: {
          enabled: { type: Boolean, default: false },
          duration: Number, // in hours
        },
        slowMode: { type: Number, default: 0 }, // delay in seconds
        maxMessageLength: { type: Number, default: 1000 },
      },
      media: {
        allowedTypes: [String],
        maxFileSize: Number,
        storageLimit: Number,
      },
    },

    // Content Management
    content: {
      pinnedMessages: [
        {
          messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
          pinnedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          pinnedAt: Date,
        },
      ],
      rules: [
        {
          title: String,
          description: String,
          createdAt: Date,
        },
      ],
      announcements: [
        {
          content: String,
          createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          createdAt: Date,
        },
      ],
    },

    // Statistics
    stats: {
      memberCount: { type: Number, default: 0 },
      messageCount: { type: Number, default: 0 },
      mediaCount: { type: Number, default: 0 },
      activeMembers: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          lastActive: Date,
        },
      ],
      activityMetrics: {
        dailyMessages: { type: Number, default: 0 },
        weeklyActiveUsers: { type: Number, default: 0 },
        monthlyActiveUsers: { type: Number, default: 0 },
      },
    },

    // Moderation
    moderation: {
      moderators: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          addedAt: Date,
        },
      ],
      bannedUsers: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          bannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          reason: String,
          bannedAt: Date,
        },
      ],
      reportedMessages: [
        {
          messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
          reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          reason: String,
          status: String,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
groupSchema.index({ name: "text", description: "text" });
groupSchema.index({ "members.userId": 1 });
groupSchema.index({ createdAt: -1 });
groupSchema.index({ "stats.memberCount": -1 });

// Pre-save middleware
groupSchema.pre("save", function (next) {
  if (this.isModified("members")) {
    this.stats.memberCount = this.members.length;
  }
  next();
});

const Group = mongoose.model("Group", groupSchema);

export default Group;
