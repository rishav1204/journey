import mongoose from "mongoose";

const searchSettingsSchema = new mongoose.Schema(
  {
    // Core User Association
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // Search Preferences
    preferences: {
      scope: {
        searchInArchived: { type: Boolean, default: false },
        includeDeleted: { type: Boolean, default: false },
        searchInMedia: { type: Boolean, default: true },
        searchInLinks: { type: Boolean, default: true },
      },
      results: {
        limit: { type: Number, default: 20, min: 5, max: 100 },
        sortBy: {
          type: String,
          enum: ["relevance", "date_desc", "date_asc", "type"],
          default: "relevance",
        },
        groupBy: {
          type: String,
          enum: ["none", "date", "type", "chat"],
          default: "none",
        },
      },
      display: {
        showSnippets: { type: Boolean, default: true },
        highlightMatches: { type: Boolean, default: true },
        previewLength: { type: Number, default: 100 },
      },
      filters: {
        defaultDateRange: {
          type: String,
          enum: ["all", "today", "week", "month", "year"],
          default: "all",
        },
        defaultContentTypes: [
          {
            type: String,
            enum: ["text", "image", "video", "audio", "document"],
          },
        ],
      },
    },

    // Search History
    history: {
      recentSearches: [
        {
          query: String,
          timestamp: Date,
          type: String,
          resultCount: Number,
          lastUsed: Date,
          useCount: { type: Number, default: 1 },
        },
      ],
      savedSearches: [
        {
          name: String,
          query: String,
          filters: {
            dateRange: {
              start: Date,
              end: Date,
            },
            types: [String],
            participants: [
              {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
              },
            ],
          },
          lastUsed: Date,
          useCount: { type: Number, default: 0 },
        },
      ],
      maxRecentSearches: { type: Number, default: 10 },
      maxSavedSearches: { type: Number, default: 20 },
    },

    // Performance Settings
    performance: {
      cacheResults: { type: Boolean, default: true },
      cacheDuration: { type: Number, default: 3600 }, // seconds
      autoComplete: { type: Boolean, default: true },
      fuzzySearch: { type: Boolean, default: true },
      minQueryLength: { type: Number, default: 2 },
    },

    // Notifications
    notifications: {
      newResults: { type: Boolean, default: false },
      savedSearchAlerts: { type: Boolean, default: false },
      frequency: {
        type: String,
        enum: ["immediate", "daily", "weekly", "never"],
        default: "never",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
searchSettingsSchema.index({ userId: 1 });
searchSettingsSchema.index({ "history.recentSearches.timestamp": -1 });

// Methods
searchSettingsSchema.methods.addRecentSearch = function (query) {
  const maxRecent = this.history.maxRecentSearches;
  this.history.recentSearches.unshift({
    query,
    timestamp: new Date(),
    type: "text",
  });
  this.history.recentSearches = this.history.recentSearches.slice(0, maxRecent);
};

const SearchSettings = mongoose.model("SearchSettings", searchSettingsSchema);

export default SearchSettings;
