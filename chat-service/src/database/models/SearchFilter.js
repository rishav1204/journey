import mongoose from "mongoose";

const searchFilterSchema = new mongoose.Schema(
  {
    // Core Filter Info
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Filter Configuration
    config: {
      type: {
        type: String,
        enum: ["saved", "custom", "shared", "system"],
        default: "custom",
      },
      isDefault: { type: Boolean, default: false },
      icon: String,
      color: String,
      order: Number,
    },

    // Search Criteria
    criteria: {
      query: {
        keywords: [String],
        excludeWords: [String],
        exactPhrases: [String],
      },
      content: {
        messageTypes: [
          {
            type: String,
            enum: [
              "text",
              "media",
              "voice",
              "file",
              "location",
              "poll",
              "system",
            ],
          },
        ],
        mediaTypes: [
          {
            type: String,
            enum: ["image", "video", "audio", "document", "gif", "sticker"],
          },
        ],
        flags: {
          hasAttachments: Boolean,
          hasLinks: Boolean,
          hasMentions: Boolean,
          isForwarded: Boolean,
        },
      },
      timeframe: {
        dateRange: {
          start: Date,
          end: Date,
        },
        timeOfDay: {
          start: String,
          end: String,
        },
        daysOfWeek: [Number],
      },
      scope: {
        conversations: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
          },
        ],
        groups: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
          },
        ],
        channels: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Channel",
          },
        ],
        participants: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
      },
      status: [
        {
          type: String,
          enum: ["unread", "starred", "pinned", "archived", "deleted"],
        },
      ],
    },

    // Usage Stats
    stats: {
      useCount: { type: Number, default: 0 },
      lastUsed: Date,
      averageResults: Number,
      successRate: Number,
    },

    // Sharing
    sharing: {
      isShared: { type: Boolean, default: false },
      sharedWith: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          sharedAt: Date,
          permissions: {
            type: String,
            enum: ["view", "edit"],
            default: "view",
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
searchFilterSchema.index({ userId: 1, "config.type": 1 });
searchFilterSchema.index({ "stats.lastUsed": -1 });
searchFilterSchema.index(
  {
    userId: 1,
    name: 1,
  },
  {
    unique: true,
  }
);

const SearchFilter = mongoose.model("SearchFilter", searchFilterSchema);

export default SearchFilter;
