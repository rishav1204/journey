import mongoose from "mongoose";

const userSettingsSchema = new mongoose.Schema(
  {
    // Core Association
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // Display & Theme
    appearance: {
      theme: {
        mode: {
          type: String,
          enum: ["light", "dark", "system"],
          default: "system",
        },
        color: {
          primary: String,
          secondary: String,
          accent: String,
        },
        background: {
          type: String,
          url: String,
          blur: Number,
        },
      },
      typography: {
        fontFamily: String,
        fontSize: String,
        messageAlignment: {
          type: String,
          enum: ["left", "right"],
          default: "left",
        },
      },
      customization: {
        css: String,
        animations: { type: Boolean, default: true },
      },
    },

    // Profile Personalization
    profile: {
      displayName: String,
      bio: {
        text: String,
        lastUpdated: Date,
      },
      avatar: {
        url: String,
        thumbnail: String,
      },
      status: {
        text: String,
        emoji: String,
        expiresAt: Date,
        clearAfter: Number,
      },
    },

    // Notification Preferences
    notifications: {
      channels: {
        push: {
          enabled: { type: Boolean, default: true },
          sound: { type: Boolean, default: true },
          vibration: { type: Boolean, default: true },
          preview: { type: Boolean, default: true },
        },
        email: {
          enabled: { type: Boolean, default: false },
          digest: {
            frequency: {
              type: String,
              enum: ["immediate", "daily", "weekly", "never"],
              default: "never",
            },
            time: String,
            timezone: String,
          },
        },
      },
      preferences: {
        quietHours: [
          {
            start: String,
            end: String,
            days: [Number],
          },
        ],
        exceptions: [
          {
            type: String,
            enum: ["mention", "reply", "critical"],
            notify: Boolean,
          },
        ],
      },
      muted: [
        {
          entityId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "entityType",
          },
          entityType: {
            type: String,
            enum: ["Conversation", "Group", "Channel"],
          },
          until: Date,
          settings: {
            muteAll: Boolean,
            exceptions: [String],
          },
        },
      ],
    },

    // Privacy & Security
    privacy: {
      visibility: {
        lastSeen: {
          type: String,
          enum: ["everyone", "contacts", "nobody"],
          default: "everyone",
        },
        profile: {
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
      interactions: {
        readReceipts: { type: Boolean, default: true },
        typingIndicator: { type: Boolean, default: true },
        messagePreview: { type: Boolean, default: true },
      },
      security: {
        twoFactorAuth: { type: Boolean, default: false },
        loginAlerts: { type: Boolean, default: true },
      },
    },

    // Device Management
    devices: {
      sync: {
        enabled: { type: Boolean, default: true },
        preferences: {
          media: { type: Boolean, default: true },
          history: { type: Boolean, default: true },
          settings: { type: Boolean, default: true },
        },
      },
      registered: [
        {
          deviceId: String,
          name: String,
          platform: String,
          lastActive: Date,
          capabilities: [String],
        },
      ],
    },

    // AI Features
    ai: {
      smartReplies: {
        enabled: { type: Boolean, default: true },
        language: String,
        style: {
          type: String,
          enum: ["formal", "casual", "friendly"],
          default: "casual",
        },
      },
      autoTranslation: {
        enabled: { type: Boolean, default: false },
        targetLanguage: String,
      },
      contentFiltering: {
        enabled: { type: Boolean, default: true },
        sensitivity: {
          type: String,
          enum: ["low", "medium", "high"],
          default: "medium",
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSettingsSchema.index({ userId: 1 });
userSettingsSchema.index({ "devices.registered.deviceId": 1 });

const UserSettings = mongoose.model("UserSettings", userSettingsSchema);

export default UserSettings;
