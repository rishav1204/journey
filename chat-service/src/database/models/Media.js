import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    // Core Media Info
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // File Details
    file: {
      originalName: String,
      fileName: String,
      fileSize: Number,
      extension: String,
      mimeType: String,
      encoding: String,
      hash: String, // For duplicate detection
    },

    // Media Type & URLs
    mediaType: {
      type: String,
      enum: ["image", "video", "audio", "document", "voice", "gif", "sticker"],
      required: true,
    },
    urls: {
      original: String,
      thumbnail: String,
      preview: String,
      optimized: String,
    },
    storage: {
      provider: {
        type: String,
        enum: ["cloudinary", "s3", "local"],
        required: true,
      },
      publicId: String,
      path: String,
      bucket: String,
    },

    // Media Properties
    metadata: {
      dimensions: {
        width: Number,
        height: Number,
        aspectRatio: Number,
      },
      duration: Number, // For audio/video
      format: String,
      bitrate: Number,
      codec: String,
      compression: {
        isCompressed: Boolean,
        originalSize: Number,
        compressedSize: Number,
        quality: Number,
        method: String,
      },
    },

    // Content Info
    content: {
      caption: String,
      title: String,
      description: String,
      tags: [String],
      language: String,
    },

    // Processing
    processing: {
      status: {
        type: String,
        enum: ["pending", "processing", "completed", "failed"],
        default: "pending",
      },
      progress: Number,
      error: String,
      completedAt: Date,
      versions: [
        {
          type: String,
          url: String,
          size: Number,
          createdAt: Date,
        },
      ],
    },

    // Access Control
    access: {
      isPublic: { type: Boolean, default: false },
      isDownloadable: { type: Boolean, default: true },
      isExpirable: Boolean,
      expiresAt: Date,
      password: String,
      allowedUsers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },

    // Usage Stats
    stats: {
      views: { type: Number, default: 0 },
      downloads: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      lastAccessed: Date,
    },

    // Security
    security: {
      encryption: {
        isEncrypted: Boolean,
        algorithm: String,
        key: String,
      },
      signature: String,
      contentModeration: {
        isChecked: Boolean,
        result: String,
        score: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
mediaSchema.index({ "file.hash": 1 });
mediaSchema.index({ mediaType: 1 });
mediaSchema.index({ "access.expiresAt": 1 });
mediaSchema.index({ "content.tags": 1 });

// Pre-save middleware
mediaSchema.pre("save", function (next) {
  if (this.metadata.dimensions) {
    this.metadata.dimensions.aspectRatio =
      this.metadata.dimensions.width / this.metadata.dimensions.height;
  }
  next();
});

const Media = mongoose.model("Media", mediaSchema);

export default Media;
