// src/services/userSettingsService.js
import User from "../database/models/User.js";
import Device from "../database/models/Device.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import { emitSocketEvent } from "../utils/socketEvents.js";
import logger from "../utils/logger.js";
import { uploadToCloud } from "../utils/cloudStorage.js";

export const updateThemeService = async (userId, theme) => {
  try {
    // Validate theme options
    const validThemes = ["light", "dark", "system", "custom"];
    if (!validThemes.includes(theme.mode)) {
      throw new ValidationError("Invalid theme mode");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        "settings.theme": theme,
      },
      { new: true }
    );

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Sync theme across user's devices
    emitSocketEvent(`user:${userId}`, "theme_updated", {
      theme: user.settings.theme,
    });

    return user.settings.theme;
  } catch (error) {
    logger.error("Error in updateThemeService:", error);
    throw error;
  }
};

export const updateNicknameService = async (userId, targetUserId, nickname) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Update or add nickname
    const nicknameObj = {
      userId: targetUserId,
      nickname,
      updatedAt: new Date(),
    };

    const nicknameIndex = user.settings.nicknames.findIndex(
      (n) => n.userId.toString() === targetUserId
    );

    if (nicknameIndex > -1) {
      user.settings.nicknames[nicknameIndex] = nicknameObj;
    } else {
      user.settings.nicknames.push(nicknameObj);
    }

    await user.save();
    return nicknameObj;
  } catch (error) {
    logger.error("Error in updateNicknameService:", error);
    throw error;
  }
};

export const updateBioService = async (userId, bio) => {
  try {
    const user = await User.findByIdAndUpdate(userId, { bio }, { new: true });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return { bio: user.bio };
  } catch (error) {
    logger.error("Error in updateBioService:", error);
    throw error;
  }
};

export const updateProfilePictureService = async (userId, imageUrl) => {
  try {
    // Upload image to cloud storage if URL is not provided
    const uploadedUrl = imageUrl.startsWith("http")
      ? imageUrl
      : await uploadToCloud(imageUrl);

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: uploadedUrl },
      { new: true }
    );

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Notify connected devices
    emitSocketEvent(`user:${userId}`, "profile_picture_updated", {
      profilePicture: uploadedUrl,
    });

    return { profilePicture: uploadedUrl };
  } catch (error) {
    logger.error("Error in updateProfilePictureService:", error);
    throw error;
  }
};

export const setAutoReplyService = async (
  userId,
  { message, duration, conditions }
) => {
  try {
    const autoReply = {
      message,
      active: true,
      duration: duration || null,
      conditions: conditions || {},
      createdAt: new Date(),
    };

    const user = await User.findByIdAndUpdate(
      userId,
      { "settings.autoReply": autoReply },
      { new: true }
    );

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Set expiry if duration is provided
    if (duration) {
      setTimeout(async () => {
        await User.findByIdAndUpdate(userId, {
          "settings.autoReply.active": false,
        });
      }, duration);
    }

    return user.settings.autoReply;
  } catch (error) {
    logger.error("Error in setAutoReplyService:", error);
    throw error;
  }
};

export const toggleNotificationsService = async (
  userId,
  { type, enabled, preferences }
) => {
  try {
    const updateQuery = {
      [`settings.notifications.${type}`]: {
        enabled,
        ...preferences,
      },
    };

    const user = await User.findByIdAndUpdate(userId, updateQuery, {
      new: true,
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Update notification settings on all devices
    emitSocketEvent(`user:${userId}`, "notifications_updated", {
      type,
      settings: user.settings.notifications[type],
    });

    return user.settings.notifications;
  } catch (error) {
    logger.error("Error in toggleNotificationsService:", error);
    throw error;
  }
};

export const syncDeviceService = async (userId, { deviceId, deviceInfo }) => {
  try {
    // Register or update device
    const device = await Device.findOneAndUpdate(
      { deviceId, userId },
      {
        ...deviceInfo,
        lastSync: new Date(),
      },
      { upsert: true, new: true }
    );

    // Sync user settings to device
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    emitSocketEvent(`device:${deviceId}`, "settings_sync", {
      settings: user.settings,
      timestamp: new Date(),
    });

    return {
      deviceId: device.deviceId,
      lastSync: device.lastSync,
    };
  } catch (error) {
    logger.error("Error in syncDeviceService:", error);
    throw error;
  }
};

export const toggleAIRepliesService = async (
  userId,
  { enabled, preferences }
) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        "settings.aiReplies": {
          enabled,
          preferences: preferences || {},
        },
      },
      { new: true }
    );

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user.settings.aiReplies;
  } catch (error) {
    logger.error("Error in toggleAIRepliesService:", error);
    throw error;
  }
};
