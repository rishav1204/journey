import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    // Core Conversation Info
    title: String, // For group conversations
    type: {
      type: String,
      enum: ["direct", "group", "self"],
      default: "direct",
      required: true,
    },

    // Participants Management
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        nickname: String,
        isActive: { type: Boolean, default: true },
      },
    ],

    // Message Management
    lastMessage: {
      messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
      content: String,
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      timestamp: Date,
      type: String,
    },
    messageStats: {
      totalMessages: { type: Number, default: 0 },
      mediaCount: { type: Number, default: 0 },
      lastActivity: Date,
    },

    // Read Status
    readStatus: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        lastRead: Date,
        unreadCount: { type: Number, default: 0 },
      },
    ],

    // Privacy & Security
    privacy: {
      isEncrypted: { type: Boolean, default: true },
      encryptionType: {
        type: String,
        enum: ["end-to-end", "server-side", "none"],
        default: "end-to-end",
      },
      disappearingMessages: {
        enabled: { type: Boolean, default: false },
        duration: Number, // in hours
      },
    },

    // Conversation Settings
    settings: {
      theme: {
        color: String,
        background: String,
        emoji: String,
      },
      notifications: {
        enabled: { type: Boolean, default: true },
        sound: { type: Boolean, default: true },
        preview: { type: Boolean, default: true },
        muteUntil: Date,
      },
      autoDelete: {
        enabled: { type: Boolean, default: false },
        duration: Number, // in days
      },
      permissions: {
        canSendMedia: { type: Boolean, default: true },
        canSendFiles: { type: Boolean, default: true },
        canMention: { type: Boolean, default: true },
      },
    },

    // Pinned Content
    pinnedMessages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],

    // Stats & Analytics
    stats: {
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      activeParticipants: { type: Number, default: 0 },
      dailyMessages: { type: Number, default: 0 },
      weeklyMessages: { type: Number, default: 0 },
      lastActiveDate: Date,
    },

    // Metadata
    metadata: {
      labels: [String],
      customData: Map,
      isArchived: { type: Boolean, default: false },
      isFavorite: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
conversationSchema.index({ "participants.userId": 1 });
conversationSchema.index({ type: 1 });
conversationSchema.index({ createdAt: -1 });
conversationSchema.index({ "metadata.isArchived": 1 });
conversationSchema.index({ "lastMessage.timestamp": -1 });

// Compound Indexes
conversationSchema.index({
  "participants.userId": 1,
  "metadata.isArchived": 1,
});

// Pre-save middleware
conversationSchema.pre("save", function (next) {
  if (this.isModified("participants")) {
    this.stats.activeParticipants = this.participants.filter(
      (p) => p.isActive
    ).length;
  }
  next();
});

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
