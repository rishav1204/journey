import mongoose from "mongoose";

const deviceSyncSchema = new mongoose.Schema(
  {
    // Core Device Info
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    deviceId: {
      type: String,
      required: true,
    },
    deviceInfo: {
      name: String,
      type: {
        type: String,
        enum: ["mobile", "tablet", "desktop", "web"],
        required: true,
      },
      platform: String,
      osVersion: String,
      appVersion: String,
      pushToken: String,
      lastActive: Date,
    },

    // Sync Configuration
    syncConfig: {
      autoSync: { type: Boolean, default: true },
      syncInterval: { type: Number, default: 300 }, // seconds
      syncTypes: [
        {
          type: String,
          enum: ["messages", "media", "settings", "contacts"],
        },
      ],
      dataPriority: {
        type: String,
        enum: ["high", "medium", "low"],
        default: "medium",
      },
    },

    // Sync Status
    syncStatus: {
      current: {
        type: String,
        enum: ["pending", "in_progress", "completed", "failed", "cancelled"],
        default: "pending",
      },
      lastSyncAttempt: Date,
      lastSuccessfulSync: Date,
      nextScheduledSync: Date,
      consecutiveFailures: { type: Number, default: 0 },
    },

    // Sync Tokens & Authentication
    authentication: {
      syncToken: String,
      refreshToken: String,
      tokenExpiry: Date,
      encryptionKey: String,
    },

    // Sync Data Management
    syncData: {
      messages: [
        {
          messageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
          },
          status: {
            type: String,
            enum: ["pending", "synced", "failed"],
            default: "pending",
          },
          syncedAt: Date,
          retryCount: { type: Number, default: 0 },
        },
      ],
      media: [
        {
          fileId: String,
          type: String,
          size: Number,
          status: {
            type: String,
            enum: ["queued", "downloading", "completed", "failed"],
            default: "queued",
          },
          progress: { type: Number, default: 0 },
        },
      ],
      settings: {
        version: Number,
        timestamp: Date,
        changes: [
          {
            key: String,
            oldValue: mongoose.Schema.Types.Mixed,
            newValue: mongoose.Schema.Types.Mixed,
            syncedAt: Date,
          },
        ],
      },
    },

    // Performance Metrics
    metrics: {
      averageSyncDuration: Number,
      dataTransferred: {
        uploaded: Number,
        downloaded: Number,
      },
      syncSuccessRate: Number,
      lastSyncSpeed: Number,
    },

    // Error Handling
    errors: [
      {
        code: String,
        message: String,
        timestamp: Date,
        component: String,
        resolved: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
deviceSyncSchema.index({ userId: 1, deviceId: 1 }, { unique: true });
deviceSyncSchema.index({ "syncStatus.lastSyncAttempt": -1 });
deviceSyncSchema.index({ "deviceInfo.lastActive": -1 });

// Pre-save middleware
deviceSyncSchema.pre("save", function (next) {
  if (this.isModified("syncStatus.current")) {
    if (this.syncStatus.current === "failed") {
      this.syncStatus.consecutiveFailures += 1;
    } else if (this.syncStatus.current === "completed") {
      this.syncStatus.consecutiveFailures = 0;
      this.syncStatus.lastSuccessfulSync = new Date();
    }
  }
  next();
});

const DeviceSync = mongoose.model("DeviceSync", deviceSyncSchema);

export default DeviceSync;
