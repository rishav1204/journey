import mongoose from "mongoose";

const userStatusSchema = new mongoose.Schema(
  {
    // Core User Association
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // Online Status
    presence: {
      isOnline: { type: Boolean, default: false },
      lastSeen: Date,
      platform: {
        type: String,
        enum: ["mobile", "web", "desktop"],
        default: "web",
      },
      status: {
        type: String,
        enum: ["available", "away", "busy", "invisible"],
        default: "available",
      },
    },

    // Custom Status
    customStatus: {
      text: {
        type: String,
        maxlength: 100,
      },
      emoji: String,
      clearAt: Date,
      history: [
        {
          text: String,
          emoji: String,
          usedAt: Date,
        },
      ],
    },

    // Activity Indicators
    activity: {
      typing: [
        {
          conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
          },
          startedAt: { type: Date, default: Date.now },
          expiresAt: Date,
        },
      ],
      currentlyViewing: {
        type: {
          type: String,
          enum: ["conversation", "group", "channel"],
        },
        id: mongoose.Schema.Types.ObjectId,
        startedAt: Date,
      },
    },

    // Device Status
    devices: [
      {
        deviceId: String,
        platform: String,
        isOnline: Boolean,
        lastActive: Date,
        ipAddress: String,
      },
    ],

    // Privacy
    privacy: {
      showLastSeen: { type: Boolean, default: true },
      showOnlineStatus: { type: Boolean, default: true },
      showTypingStatus: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userStatusSchema.index({ userId: 1 });
userStatusSchema.index({ "presence.isOnline": 1 });
userStatusSchema.index({ "presence.lastSeen": -1 });
userStatusSchema.index({ "activity.typing.conversationId": 1 });

// Methods
userStatusSchema.methods.updatePresence = function (status) {
  this.presence.isOnline = status;
  this.presence.lastSeen = new Date();
  return this.save();
};

const UserStatus = mongoose.model("UserStatus", userStatusSchema);

export default UserStatus;
