import {
  searchMessagesService,
  searchMediaService,
  searchChatService,
  searchGroupService,
  searchChannelService,
  searchUsersService,
  filterMessagesService,
} from "../services/searchService.js";
import { trackSearchHistory } from "../services/searchHistoryService.js";
import {
  getRecentSearches,
  getPopularSearches,
} from "../services/searchHistoryService.js";
import { deleteSearchHistoryService } from "../services/searchHistoryService.js";
import logger from "../utils/logger.js";

export const searchMessages = async (req, res) => {
  try {
    const startTime = Date.now();
    const { query, type, startDate, endDate } = req.query;
    const userId = req.user.id;

    const results = await searchMessagesService({
      userId,
      query,
      startDate,
      endDate,
      type,
    });

    // Track search history
    await trackSearchHistory(userId, {
      query,
      type: "message",
      filters: { startDate, endDate, type },
      resultCount: results.total,
      responseTime: Date.now() - startTime,
    });

    res.json(results);
  } catch (error) {
    next(error);
  }
};

export const searchMedia = async (req, res) => {
  try {
    const { type, startDate, endDate, page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    const media = await searchMediaService({
      userId,
      type,
      startDate,
      endDate,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json({
      success: true,
      data: media,
    });
  } catch (error) {
    logger.error("Error searching media:", error);
    res.status(500).json({
      success: false,
      message: "Error searching media",
      error: error.message,
    });
  }
};

export const searchChat = async (req, res) => {
  try {
    const { chatId, query, page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    const messages = await searchChatService({
      userId,
      chatId,
      query,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    logger.error("Error searching chat:", error);
    res.status(500).json({
      success: false,
      message: "Error searching chat",
      error: error.message,
    });
  }
};

export const searchGroup = async (req, res) => {
  try {
    const { groupId, query, page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    const messages = await searchGroupService({
      userId,
      groupId,
      query,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    logger.error("Error searching group:", error);
    res.status(500).json({
      success: false,
      message: "Error searching group",
      error: error.message,
    });
  }
};

export const searchChannel = async (req, res) => {
  try {
    const { channelId, query, page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    const messages = await searchChannelService({
      userId,
      channelId,
      query,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    logger.error("Error searching channel:", error);
    res.status(500).json({
      success: false,
      message: "Error searching channel",
      error: error.message,
    });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query, page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    const users = await searchUsersService({
      userId,
      query,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    logger.error("Error searching users:", error);
    res.status(500).json({
      success: false,
      message: "Error searching users",
      error: error.message,
    });
  }
};

export const filterMessages = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    const messages = await filterMessagesService({
      userId,
      type,
      status,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    logger.error("Error filtering messages:", error);
    res.status(500).json({
      success: false,
      message: "Error filtering messages",
      error: error.message,
    });
  }
};

export const getRecentSearchesController = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user.id;

    const searches = await getRecentSearches(userId, parseInt(limit));

    res.json({
      success: true,
      data: searches,
    });
  } catch (error) {
    next(error);
  }
};

export const getPopularSearchesController = async (req, res) => {
  try {
    const { timeframe = "24h", limit = 10 } = req.query;

    const searches = await getPopularSearches(timeframe, parseInt(limit));

    res.json({
      success: true,
      data: searches,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSearchHistory = async (req, res) => {
  try {
    const { searchId } = req.params;
    const userId = req.user.id;

    await deleteSearchHistoryService(searchId, userId);

    res.status(200).json({
      success: true,
      message: "Search history entry deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting search history:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Error deleting search history",
    });
  }
};