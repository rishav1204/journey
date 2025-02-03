import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "itemType",
  },
  itemType: {
    type: String,
    enum: ["Message", "User", "Group", "Channel", "Media"],
  },
  matchData: {
    field: String,
    snippet: String,
    score: Number,
    position: Number,
  },
  clicked: {
    isClicked: { type: Boolean, default: false },
    clickedAt: Date,
  },
});

const searchHistorySchema = new mongoose.Schema(
  {
    // Search Context
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Search Query
    query: {
      text: {
        type: String,
        required: true,
        trim: true,
      },
      type: {
        type: String,
        enum: [
          "message",
          "media",
          "chat",
          "group",
          "channel",
          "user",
          "global",
        ],
        required: true,
      },
      language: String,
      originalQuery: String, // Before any processing
    },

    // Search Filters
    filters: {
      date: {
        start: Date,
        end: Date,
      },
      content: {
        types: [
          {
            type: String,
            enum: ["text", "image", "video", "audio", "document", "link"],
          },
        ],
        searchInAttachments: { type: Boolean, default: true },
        searchInLinks: { type: Boolean, default: true },
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
      },
      advanced: {
        caseSensitive: { type: Boolean, default: false },
        exactMatch: { type: Boolean, default: false },
        excludeWords: [String],
      },
    },

    // Search Results
    results: {
      items: [resultSchema],
      summary: {
        totalCount: Number,
        matchedTypes: Map,
        executionTime: Number,
      },
      pagination: {
        page: Number,
        limit: Number,
        hasMore: Boolean,
      },
    },

    // Performance Metrics
    metrics: {
      responseTime: Number,
      resultCount: Number,
      refinements: Number,
      cachedResult: Boolean,
    },

    // User Interaction
    interaction: {
      selectedResults: [
        {
          itemId: mongoose.Schema.Types.ObjectId,
          selectedAt: Date,
        },
      ],
      refinements: [
        {
          query: String,
          timestamp: Date,
        },
      ],
      abandoned: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
searchHistorySchema.index({ userId: 1, createdAt: -1 });
searchHistorySchema.index({ "query.text": "text" });
searchHistorySchema.index({ "query.type": 1 });
searchHistorySchema.index({
  userId: 1,
  "query.type": 1,
  createdAt: -1,
});

// TTL Index for auto-deletion after 30 days
searchHistorySchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 30 * 24 * 60 * 60,
  }
);

const SearchHistory = mongoose.model("SearchHistory", searchHistorySchema);

export default SearchHistory;
