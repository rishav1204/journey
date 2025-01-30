import SearchHistory from "../models/SearchHistory.js";
import { NotFoundError, AuthorizationError } from "../utils/errors.js";
import logger from "../utils/logger.js";


export const trackSearchHistory = async (userId, searchData) => {
  const startTime = Date.now();

  try {
    await SearchHistory.create({
      userId,
      query: {
        text: searchData.query,
        type: searchData.type,
      },
      filters: searchData.filters,
      metrics: {
        resultCount: searchData.resultCount,
        responseTime: Date.now() - startTime,
      },
    });
  } catch (error) {
    logger.error("Error tracking search history:", error);
  }
};

export const getRecentSearches = async (userId, limit = 10) => {
  const searches = await SearchHistory.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);

  return searches;
};

export const getPopularSearches = async (timeframe = "24h", limit = 10) => {
  const date = new Date();
  date.setHours(date.getHours() - 24);

  const searches = await SearchHistory.aggregate([
    {
      $match: {
        createdAt: { $gte: date },
      },
    },
    {
      $group: {
        _id: "$query.text",
        count: { $sum: 1 },
        avgResults: { $avg: "$metrics.resultCount" },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: limit,
    },
  ]);

  return searches;
};

export const deleteSearchHistoryService = async (searchId, userId) => {
  try {
    const searchEntry = await SearchHistory.findById(searchId);

    if (!searchEntry) {
      throw new NotFoundError("Search history entry not found");
    }

    // Verify ownership
    if (searchEntry.userId.toString() !== userId) {
      throw new AuthorizationError(
        "Not authorized to delete this search history"
      );
    }

    await SearchHistory.findByIdAndDelete(searchId);

    return true;
  } catch (error) {
    logger.error("Delete search history error:", {
      searchId,
      userId,
      error: error.message,
    });
    throw error;
  }
};
