import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Core User Fields (Synced with user-service)
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      first: String,
      last: String,
    },
    phone: String,
    profilePicture: String,
    isVerified: { type: Boolean, default: false },

    // Chat-Specific Fields
    chatProfile: {
      status: {
        isOnline: { type: Boolean, default: false },
        lastSeen: Date,
        custom: {
          text: String,
          emoji: String,
          expiresAt: Date,
        },
      },
      preferences: {
        theme: {
          mode: {
            type: String,
            enum: ["light", "dark", "system"],
            default: "system",
          },
          color: String,
        },
        notifications: {
          enabled: { type: Boolean, default: true },
          sound: { type: Boolean, default: true },
          preview: { type: Boolean, default: true },
        },
        privacy: {
          lastSeen: {
            type: String,
            enum: ["everyone", "contacts", "none"],
            default: "everyone",
          },
          profilePhoto: {
            type: String,
            enum: ["everyone", "contacts", "none"],
            default: "everyone",
          },
          status: {
            type: String,
            enum: ["everyone", "contacts", "none"],
            default: "everyone",
          },
        },
      },
    },

    // Chat Connections
    connections: {
      contacts: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          nickname: String,
          addedAt: { type: Date, default: Date.now },
        },
      ],
      blockedUsers: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          blockedAt: { type: Date, default: Date.now },
          reason: String,
        },
      ],
      devices: [
        {
          deviceId: String,
          name: String,
          platform: String,
          lastActive: Date,
          pushToken: String,
        },
      ],
    },

    // Chat Activity
    activity: {
      lastActive: Date,
      activeChats: [
        {
          type: { type: String, enum: ["direct", "group", "channel"] },
          id: mongoose.Schema.Types.ObjectId,
          lastAccessed: Date,
        },
      ],
      typingIn: [
        {
          chatId: mongoose.Schema.Types.ObjectId,
          timestamp: Date,
        },
      ],
    },

    // Chat Stats
    stats: {
      totalMessages: { type: Number, default: 0 },
      totalMediaShared: { type: Number, default: 0 },
      totalCalls: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ "chatProfile.status.isOnline": 1 });
userSchema.index({ "connections.contacts.userId": 1 });
userSchema.index({ "activity.lastActive": -1 });

// Methods
userSchema.methods.updateOnlineStatus = async function (status) {
  this.chatProfile.status.isOnline = status;
  this.chatProfile.status.lastSeen = new Date();
  this.activity.lastActive = new Date();
  return this.save();
};

userSchema.methods.addContact = async function (userId) {
  if (
    !this.connections.contacts.some((contact) => contact.userId.equals(userId))
  ) {
    this.connections.contacts.push({ userId });
    return this.save();
  }
  return this;
};

const User = mongoose.model("User", userSchema);

export default User;
