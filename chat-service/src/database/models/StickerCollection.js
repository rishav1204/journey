import mongoose from "mongoose";

const stickerSchema = new mongoose.Schema({
  // Core Sticker Data
  id: {
    type: String,
    required: true,
    unique: true,
  },
  assets: {
    original: {
      url: String,
      size: Number,
      dimensions: {
        width: Number,
        height: Number,
      },
    },
    thumbnail: {
      url: String,
      size: Number,
    },
    webp: String,
    lottie: String,
  },

  // Metadata
  metadata: {
    name: String,
    creator: String,
    category: String,
    tags: [String],
    language: String,
    contentRating: {
      type: String,
      enum: ["universal", "teen", "mature"],
      default: "universal",
    },
  },
});

const stickerCollectionSchema = new mongoose.Schema(
  {
    // Collection Info
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Collection Type
    type: {
      isCustom: { type: Boolean, default: false },
      isPremium: { type: Boolean, default: false },
      isAnimated: { type: Boolean, default: false },
    },

    // Content
    stickers: [stickerSchema],

    // Usage Stats
    stats: {
      totalStickers: { type: Number, default: 0 },
      totalUses: { type: Number, default: 0 },
      recentlyUsed: [
        {
          stickerId: String,
          usedAt: Date,
          chatId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "chatType",
          },
          chatType: {
            type: String,
            enum: ["Conversation", "Group", "Channel"],
          },
        },
      ],
      popularStickers: [
        {
          stickerId: String,
          useCount: Number,
        },
      ],
    },

    // Access Control
    access: {
      visibility: {
        type: String,
        enum: ["private", "shared", "public"],
        default: "private",
      },
      sharedWith: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          sharedAt: Date,
        },
      ],
      password: String,
    },

    // Organization
    organization: {
      order: Number,
      category: String,
      tags: [String],
      featured: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
stickerCollectionSchema.index({ owner: 1 });
stickerCollectionSchema.index({ "organization.category": 1 });
stickerCollectionSchema.index({ "organization.tags": 1 });
stickerCollectionSchema.index({ "stats.totalUses": -1 });

// Pre-save middleware
stickerCollectionSchema.pre("save", function (next) {
  this.stats.totalStickers = this.stickers.length;
  next();
});

const StickerCollection = mongoose.model(
  "StickerCollection",
  stickerCollectionSchema
);

export default StickerCollection;
