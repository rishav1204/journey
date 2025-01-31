// src/services/privacyServices.js
import User from "../database/models/User.js";
import Chat from "../database/models/Chat.js";
import Block from "../database/models/Block.js";
import Report from "../database/models/Report.js";
import { NotFoundError } from "../utils/errors.js";
import { emitSocketEvent } from "../utils/socketEvents.js";
import logger from "../utils/logger.js";

export const blockUserService = async (userId, blockerId) => {
  const session = await User.startSession();
  try {
    session.startTransaction();

    // Check if users exist
    const [userToBlock, blocker] = await Promise.all([
      User.findById(userId).session(session),
      User.findById(blockerId).session(session),
    ]);

    if (!userToBlock || !blocker) {
      throw new NotFoundError("User not found");
    }

    // Check if already blocked
    const existingBlock = await Block.findOne({ userId, blockerId });
    if (existingBlock) {
      throw new Error("User is already blocked");
    }

    // Create block record
    const block = await Block.create(
      [
        {
          userId,
          blockerId,
          createdAt: new Date(),
        },
      ],
      { session }
    );

    // Update user's blocked list
    await User.findByIdAndUpdate(
      blockerId,
      { $addToSet: { blockedUsers: userId } },
      { session }
    );

    await session.commitTransaction();

    // Notify blocked user through WebSocket
    emitSocketEvent(`user:${userId}`, "user_blocked", {
      blockerId,
      timestamp: new Date(),
    });

    return block[0];
  } catch (error) {
    await session.abortTransaction();
    logger.error("Error in blockUserService:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

export const unblockUserService = async (userId, unblockerId) => {
  const session = await User.startSession();
  try {
    session.startTransaction();

    const block = await Block.findOneAndDelete(
      { userId, blockerId: unblockerId },
      { session }
    );

    if (!block) {
      throw new NotFoundError("Block not found");
    }

    // Remove from blocker's blocked list
    await User.findByIdAndUpdate(
      unblockerId,
      { $pull: { blockedUsers: userId } },
      { session }
    );

    await session.commitTransaction();

    // Notify unblocked user
    emitSocketEvent(`user:${userId}`, "user_unblocked", {
      unblockerId,
      timestamp: new Date(),
    });

    return block;
  } catch (error) {
    await session.abortTransaction();
    logger.error("Error in unblockUserService:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

export const reportUserService = async (
  userId,
  reporterId,
  reason,
  description
) => {
  try {
    const report = await Report.create({
      reportedUser: userId,
      reportedBy: reporterId,
      reason,
      description,
      type: "USER",
      status: "PENDING",
      createdAt: new Date(),
    });

    return report;
  } catch (error) {
    logger.error("Error in reportUserService:", error);
    throw error;
  }
};

export const updateLastSeenSettingsService = async (userId, visibility) => {
  try {
    const validVisibilities = ["everyone", "contacts", "nobody"];
    if (!validVisibilities.includes(visibility)) {
      throw new Error("Invalid visibility setting");
    }

    const settings = await User.findByIdAndUpdate(
      userId,
      { "privacy.lastSeen": visibility },
      { new: true, select: "privacy" }
    );

    return settings;
  } catch (error) {
    logger.error("Error in updateLastSeenSettingsService:", error);
    throw error;
  }
};

export const archiveChatService = async (chatId, userId) => {
  try {
    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, participants: userId },
      { $addToSet: { "participants.$[elem].archived": true } },
      {
        arrayFilters: [{ "elem.userId": userId }],
        new: true,
      }
    );

    if (!chat) {
      throw new NotFoundError("Chat not found");
    }

    return chat;
  } catch (error) {
    logger.error("Error in archiveChatService:", error);
    throw error;
  }
};

export const unarchiveChatService = async (chatId, userId) => {
  try {
    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, participants: userId },
      { $set: { "participants.$[elem].archived": false } },
      {
        arrayFilters: [{ "elem.userId": userId }],
        new: true,
      }
    );

    if (!chat) {
      throw new NotFoundError("Chat not found");
    }

    return chat;
  } catch (error) {
    logger.error("Error in unarchiveChatService:", error);
    throw error;
  }
};

export const muteChatService = async (chatId, userId, duration) => {
  try {
    const mutedUntil = duration ? new Date(Date.now() + duration) : null;

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, participants: userId },
      {
        $set: {
          "participants.$[elem].muted": true,
          "participants.$[elem].mutedUntil": mutedUntil,
        },
      },
      {
        arrayFilters: [{ "elem.userId": userId }],
        new: true,
      }
    );

    if (!chat) {
      throw new NotFoundError("Chat not found");
    }

    return chat;
  } catch (error) {
    logger.error("Error in muteChatService:", error);
    throw error;
  }
};

export const toggleEncryptionService = async (userId, enabled) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { "settings.encryption.enabled": enabled },
      { new: true }
    );

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user.settings.encryption;
  } catch (error) {
    logger.error("Error in toggleEncryptionService:", error);
    throw error;
  }
};

export const updateTypingStatusService = async (
  conversationId,
  userId,
  isTyping
) => {
  try {
    // Update typing status in conversation
    await Chat.findByIdAndUpdate(conversationId, {
      $set: { [`typingStatus.${userId}`]: isTyping },
    });

    // Emit typing status to other participants
    emitSocketEvent(`chat:${conversationId}`, "typing_status", {
      userId,
      isTyping,
    });
  } catch (error) {
    logger.error("Error in updateTypingStatusService:", error);
    throw error;
  }
};

export const getOnlineStatusService = async (userId) => {
  try {
    const user = await User.findById(userId, "onlineStatus lastSeen");
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return {
      online: user.onlineStatus === "online",
      lastSeen: user.lastSeen,
    };
  } catch (error) {
    logger.error("Error in getOnlineStatusService:", error);
    throw error;
  }
};

export const updateUserStatusService = async (userId, status) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { status: status },
      { new: true }
    );

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return { status: user.status };
  } catch (error) {
    logger.error("Error in updateUserStatusService:", error);
    throw error;
  }
};
