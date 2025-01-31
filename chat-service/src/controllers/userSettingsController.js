// src/controllers/userSettingsController.js

import {
  updateThemeService,
  updateNicknameService,
  updateBioService,
  updateProfilePictureService,
  setAutoReplyService,
  toggleNotificationsService,
  syncDeviceService,
  toggleAIRepliesService,
} from "../services/userSettingsService.js";
import logger from "../utils/logger.js";

export const updateTheme = async (req, res) => {
  try {
    const userId = req.user.id;
    const { theme } = req.body;

    const updatedTheme = await updateThemeService(userId, theme);

    res.status(200).json({
      success: true,
      data: updatedTheme,
    });
  } catch (error) {
    logger.error("Error updating theme:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateNickname = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId, nickname } = req.body;

    const updatedNickname = await updateNicknameService(
      userId,
      targetUserId,
      nickname
    );

    res.status(200).json({
      success: true,
      data: updatedNickname,
    });
  } catch (error) {
    logger.error("Error updating nickname:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateBio = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bio } = req.body;

    const updatedBio = await updateBioService(userId, bio);

    res.status(200).json({
      success: true,
      data: updatedBio,
    });
  } catch (error) {
    logger.error("Error updating bio:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    const { imageUrl } = req.body;

    const updatedProfile = await updateProfilePictureService(userId, imageUrl);

    res.status(200).json({
      success: true,
      data: updatedProfile,
    });
  } catch (error) {
    logger.error("Error updating profile picture:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const setAutoReply = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message, duration, conditions } = req.body;

    const autoReply = await setAutoReplyService(userId, {
      message,
      duration,
      conditions,
    });

    res.status(200).json({
      success: true,
      data: autoReply,
    });
  } catch (error) {
    logger.error("Error setting auto reply:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, enabled, preferences } = req.body;

    const notificationSettings = await toggleNotificationsService(userId, {
      type,
      enabled,
      preferences,
    });

    res.status(200).json({
      success: true,
      data: notificationSettings,
    });
  } catch (error) {
    logger.error("Error toggling notifications:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const syncDevice = async (req, res) => {
  try {
    const userId = req.user.id;
    const { deviceId, deviceInfo } = req.body;

    const syncStatus = await syncDeviceService(userId, {
      deviceId,
      deviceInfo,
    });

    res.status(200).json({
      success: true,
      data: syncStatus,
    });
  } catch (error) {
    logger.error("Error syncing device:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleAIReplies = async (req, res) => {
  try {
    const userId = req.user.id;
    const { enabled, preferences } = req.body;

    const aiSettings = await toggleAIRepliesService(userId, {
      enabled,
      preferences,
    });

    res.status(200).json({
      success: true,
      data: aiSettings,
    });
  } catch (error) {
    logger.error("Error toggling AI replies:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};
