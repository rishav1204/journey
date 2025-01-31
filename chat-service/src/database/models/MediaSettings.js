import mongoose from "mongoose";

const mediaSettingsSchema = new mongoose.Schema(
  {
    // Core Settings
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // Download Settings
    autoDownload: {
      enabled: { type: Boolean, default: true },
      byType: {
        images: { type: Boolean, default: true },
        videos: { type: Boolean, default: false },
        documents: { type: Boolean, default: false },
        voice: { type: Boolean, default: true },
        gifs: { type: Boolean, default: true },
        stickers: { type: Boolean, default: true },
      },
      conditions: {
        onlyWiFi: { type: Boolean, default: true },
        maxFileSize: { type: Number, default: 20 }, // MB
        allowedFormats: [String],
      },
    },

    // Compression Settings
    compression: {
      enabled: { type: Boolean, default: true },
      image: {
        quality: { type: Number, min: 0, max: 100, default: 80 },
        maxWidth: { type: Number, default: 2048 },
        format: {
          type: String,
          enum: ["original", "jpg", "webp"],
          default: "original",
        },
      },
      video: {
        quality: {
          type: String,
          enum: ["low", "medium", "high", "original"],
          default: "medium",
        },
        maxDuration: { type: Number, default: 300 }, // seconds
        codec: String,
      },
    },

    voiceNoteSettings: {
      quality: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'high'
      },
      maxDuration: {
        type: Number,
        default: 300 // 5 minutes
      },
      noiseReduction: {
        enabled: Boolean,
        level: Number
      },
      autoTranscribe: Boolean
    },

    // Storage Management
    storage: {
      preferences: {
        saveToGallery: { type: Boolean, default: false },
        autoCleanup: { type: Boolean, default: false },
        separateFolders: { type: Boolean, default: true },
      },
      cleanup: {
        enabled: { type: Boolean, default: false },
        rules: [
          {
            mediaType: String,
            olderThan: Number, // days
            minFileSize: Number, // bytes
          },
        ],
        excludeStarred: { type: Boolean, default: true },
      },
      quota: {
        maxStorage: { type: Number, default: 1024 }, // MB
        warningThreshold: { type: Number, default: 80 }, // percentage
      },
    },

    // Privacy & Security
    privacy: {
      mediaPreview: { type: Boolean, default: true },
      downloadNotification: { type: Boolean, default: false },
      mediaAccess: {
        type: String,
        enum: ["everyone", "contacts", "nobody"],
        default: "everyone",
      },
    },

    // Bandwidth Management
    bandwidth: {
      dataUsage: {
        monthlyLimit: Number, // MB
        warningThreshold: Number, // percentage
        resetDay: { type: Number, default: 1 },
      },
      streaming: {
        autoPlay: { type: Boolean, default: true },
        quality: {
          type: String,
          enum: ["auto", "low", "medium", "high"],
          default: "auto",
        },
      },
    },

    // Notifications
    notifications: {
      downloadComplete: { type: Boolean, default: true },
      storageWarning: { type: Boolean, default: true },
      failedUploads: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
mediaSettingsSchema.index({ userId: 1 });
mediaSettingsSchema.index({ "storage.quota.maxStorage": 1 });

// Validations
mediaSettingsSchema.pre("save", function (next) {
  if (
    this.compression.image.quality < 0 ||
    this.compression.image.quality > 100
  ) {
    next(new Error("Image quality must be between 0 and 100"));
  }
  next();
});

const MediaSettings = mongoose.model("MediaSettings", mediaSettingsSchema);

export default MediaSettings;
