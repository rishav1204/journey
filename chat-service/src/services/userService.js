// src/services/userService.js
import User from "../database/models/User.js";
import Call from "../database/models/Call.js";
import UserStatus from "../database/models/UserStatus.js";
import { CallStatus } from "../constants/callConstants.js";
import logger from "../utils/logger.js";

export const checkUserAvailability = async (userId) => {
  try {
    // Check if user exists and is active
    const user = await User.findById(userId);
    if (!user || user.accountStatus !== "Active") {
      return {
        isAvailable: false,
        reason: "User not found or inactive",
      };
    }

    // Check if user is currently in another call
    const activeCall = await Call.findOne({
      "participants.userId": userId,
      status: CallStatus.ONGOING,
    });

    if (activeCall) {
      return {
        isAvailable: false,
        reason: "User is in another call",
        callId: activeCall._id,
      };
    }

    // Check user's online status
    const userStatus = await UserStatus.findOne({ userId });
    if (!userStatus?.presence?.isOnline) {
      return {
        isAvailable: false,
        reason: "User is offline",
      };
    }

    // Check if user has enabled Do Not Disturb
    if (userStatus.presence.status === "busy") {
      return {
        isAvailable: false,
        reason: "User has enabled Do Not Disturb",
      };
    }

    // Check device status
    const hasActiveDevice = userStatus.devices.some(
      (device) => device.isOnline
    );
    if (!hasActiveDevice) {
      return {
        isAvailable: false,
        reason: "No active device found",
      };
    }

    // Additional checks for call permissions
    const canReceiveCalls = await checkCallPermissions(userId);
    if (!canReceiveCalls.allowed) {
      return {
        isAvailable: false,
        reason: canReceiveCalls.reason,
      };
    }

    return {
      isAvailable: true,
      deviceInfo: userStatus.devices.find((d) => d.isOnline),
    };
  } catch (error) {
    logger.error("Error checking user availability:", error);
    throw error;
  }
};

const checkCallPermissions = async (userId) => {
  try {
    const user = await User.findById(userId);

    // Check if user has been rate limited
    if (user.callRestrictions?.isRateLimited) {
      return {
        allowed: false,
        reason: "Call rate limit exceeded",
      };
    }

    // Check if user has been blocked from making calls
    if (user.callRestrictions?.isBlocked) {
      return {
        allowed: false,
        reason: "User is blocked from making calls",
      };
    }

    // Check subscription status for premium features
    if (
      user.subscriptionStatus !== "Active" &&
      user.callRestrictions?.requiresPremium
    ) {
      return {
        allowed: false,
        reason: "Premium subscription required",
      };
    }

    return {
      allowed: true,
    };
  } catch (error) {
    logger.error("Error checking call permissions:", error);
    throw error;
  }
};
