import mongoose from "mongoose";

const privacySettingsSchema = new mongoose.Schema(
  {
    // Core User Association
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // Visibility Controls
    visibility: {
      lastSeen: {
        type: String,
        enum: ["everyone", "contacts", "nobody"],
        default: "everyone",
      },
      onlineStatus: {
        type: String,
        enum: ["everyone", "contacts", "nobody"],
        default: "everyone",
      },
      typingIndicator: {
        type: String,
        enum: ["everyone", "contacts", "nobody"],
        default: "everyone",
      },
      profileInfo: {
        photo: {
          type: String,
          enum: ["everyone", "contacts", "nobody"],
          default: "everyone",
        },
        about: {
          type: String,
          enum: ["everyone", "contacts", "nobody"],
          default: "everyone",
        },
        status: {
          type: String,
          enum: ["everyone", "contacts", "nobody"],
          default: "everyone",
        },
      },
    },

    // Chat Privacy
    chatPrivacy: {
      readReceipts: { type: Boolean, default: true },
      mediaDownload: {
        type: String,
        enum: ["always", "wifi_only", "never"],
        default: "always",
      },
      messageRetention: {
        duration: Number, // days, 0 = forever
        mediaOnly: Boolean,
      },
    },

    // Group Privacy
    groupPrivacy: {
      invites: {
        type: String,
        enum: ["everyone", "contacts", "nobody"],
        default: "everyone",
      },
      autoAdd: { type: Boolean, default: false },
      approvalRequired: { type: Boolean, default: false },
    },

    // Security
    security: {
      encryption: {
        enabled: { type: Boolean, default: true },
        defaultForNewChats: { type: Boolean, default: true },
        backupEncrypted: { type: Boolean, default: true },
      },
      twoFactorAuth: {
        enabled: { type: Boolean, default: false },
        method: {
          type: String,
          enum: ["app", "sms", "email"],
        },
      },
      loginAlerts: { type: Boolean, default: true },
    },

    // Chat Management
    chatManagement: {
      archived: [
        {
          chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
          },
          archivedAt: Date,
          autoArchive: Boolean,
        },
      ],
      muted: [
        {
          chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
          },
          settings: {
            duration: {
              type: String,
              enum: ["1_hour", "8_hours", "1_week", "always"],
              default: "always",
            },
            mutedUntil: Date,
            notifications: {
              show: Boolean,
              preview: Boolean,
              sound: Boolean,
              badge: Boolean,
            },
          },
        },
      ],
      blocked: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          blockedAt: Date,
          reason: String,
        },
      ],
    },

    // Notification Settings
    notifications: {
      messageNotifications: { type: Boolean, default: true },
      groupNotifications: { type: Boolean, default: true },
      callNotifications: { type: Boolean, default: true },
      sound: { type: Boolean, default: true },
      vibration: { type: Boolean, default: true },
      notificationPreview: {
        type: String,
        enum: ["show_all", "name_only", "no_preview"],
        default: "show_all",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
privacySettingsSchema.index({ userId: 1 });
privacySettingsSchema.index({ "chatManagement.archived.chatId": 1 });
privacySettingsSchema.index({ "chatManagement.muted.chatId": 1 });

const PrivacySettings = mongoose.model(
  "PrivacySettings",
  privacySettingsSchema
);

export default PrivacySettings;
