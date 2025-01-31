// src/controllers/privacyController.js

import {
  blockUserService,
  unblockUserService,
  reportUserService,
  updateLastSeenSettingsService,
  archiveChatService,
  unarchiveChatService,
  muteChatService,
  toggleEncryptionService,
  updateTypingStatusService,
  getOnlineStatusService,
  updateUserStatusService,
} from "../services/privacyServices.js";
import logger from "../utils/logger.js";

export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const blockerId = req.user.id;

    await blockUserService(userId, blockerId);

    res.status(200).json({
      success: true,
      message: "User blocked successfully",
    });
  } catch (error) {
    logger.error("Error in blocking user:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const unblockerId = req.user.id;

    await unblockUserService(userId, unblockerId);

    res.status(200).json({
      success: true,
      message: "User unblocked successfully",
    });
  } catch (error) {
    logger.error("Error in unblocking user:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const reportUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const reporterId = req.user.id;
    const { reason, description } = req.body;

    await reportUserService({
      userId,
      reporterId,
      reason,
      description,
    });

    res.status(200).json({
      success: true,
      message: "User reported successfully",
    });
  } catch (error) {
    logger.error("Error in reporting user:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateLastSeenSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { visibility } = req.body;

    const settings = await updateLastSeenSettingsService(userId, visibility);

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    logger.error("Error updating last seen settings:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const archiveChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    await archiveChatService(chatId, userId);

    res.status(200).json({
      success: true,
      message: "Chat archived successfully",
    });
  } catch (error) {
    logger.error("Error archiving chat:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const unarchiveChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    await unarchiveChatService(chatId, userId);

    res.status(200).json({
      success: true,
      message: "Chat unarchived successfully",
    });
  } catch (error) {
    logger.error("Error unarchiving chat:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const muteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const { duration } = req.body;

    await muteChatService(chatId, userId, duration);

    res.status(200).json({
      success: true,
      message: "Chat muted successfully",
    });
  } catch (error) {
    logger.error("Error muting chat:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleEncryption = async (req, res) => {
  try {
    const userId = req.user.id;
    const { enabled } = req.body;

    await toggleEncryptionService(userId, enabled);

    res.status(200).json({
      success: true,
      message: `End-to-end encryption ${
        enabled ? "enabled" : "disabled"
      } successfully`,
    });
  } catch (error) {
    logger.error("Error toggling encryption:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTypingStatus = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const { isTyping } = req.body;

    await updateTypingStatusService(conversationId, userId, isTyping);

    res.status(200).json({
      success: true,
      message: "Typing status updated successfully",
    });
  } catch (error) {
    logger.error("Error updating typing status:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOnlineStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const status = await getOnlineStatusService(userId);

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    logger.error("Error getting online status:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.body;

    const updatedStatus = await updateUserStatusService(userId, status);

    res.status(200).json({
      success: true,
      data: updatedStatus,
    });
  } catch (error) {
    logger.error("Error updating user status:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};
