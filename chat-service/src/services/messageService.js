// src/services/messageService.js
import Message from "../database/models/Message.js";
import Conversation from "../database/models/Conversation.js";
import MessageRequest from "../database/models/MessageRequest.js";
import ScheduledMessage from "../database/models/ScheduledMessage.js";
import User from "../database/models/User.js";
import {
  NotFoundError,
  ValidationError,
  PermissionError,
} from "../utils/errors.js";
import logger from "../utils/logger.js";
import { uploadToCloud, deleteFromCloud } from "../utils/cloudStorage.js";
import { emitSocketEvent } from "../utils/socketEvents.js";
import { encryptMessage, decryptMessage } from "../utils/encryption.js";
import mongoose from "mongoose"

/**
 * Send a direct message to a user
 */
export const sendDirectMessageService = async ({
  senderId,
  receiverId,
  content,
  type = "text",
  media = [],
}) => {
  try {
    // Encrypt the content before saving
    const encryptedContent = await encryptMessage(content);

    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    let conversation = await Conversation.findOne({
      participants: { $all: [senderObjectId, receiverObjectId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [
          { userId: senderObjectId, role: "member" },
          { userId: receiverObjectId, role: "member" },
        ],
        type: "direct",
      });
    }

    // Create message with encrypted content
    const message = await Message.create({
      conversationId: conversation._id,
      sender: senderObjectId,
      receiver: receiverObjectId,
      content: encryptedContent, // Save the encrypted content
      messageType: type,
      media,
      status: "sent",
      isEncrypted: true, // Make sure to set this flag
    });

    // Populate sender and receiver details
    const populatedMessage = await message.populate([
      { path: "sender", select: "username profilePicture" },
      { path: "receiver", select: "username profilePicture" },
    ]);

    // Return decrypted content for immediate use
    const messageToReturn = {
      ...populatedMessage.toObject(),
      content: content, // Return original content for immediate use
    };

    // Emit socket event with decrypted content
    emitSocketEvent(`user:${receiverId}`, "new_message", {
      message: messageToReturn,
      conversationId: conversation._id,
    });

    return messageToReturn;
  } catch (error) {
    logger.error("Error in sendDirectMessageService:", error);
    throw error;
  }
};
/**
 * Get direct messages between two users
 */
export const getDirectMessagesService = async (
  currentUserId,
  otherUserId,
  page = 1,
  limit = 50
) => {
  try {
    logger.debug("Starting getDirectMessagesService", {
      currentUserId,
      otherUserId,
    });

    const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);
    const otherUserObjectId = new mongoose.Types.ObjectId(otherUserId);
    const skip = (page - 1) * limit;

    const [messages, totalCount] = await Promise.all([
      Message.find({
        $or: [
          { sender: currentUserObjectId, receiver: otherUserObjectId },
          { sender: otherUserObjectId, receiver: currentUserObjectId },
        ],
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sender", "username profilePicture")
        .populate("receiver", "username profilePicture")
        .lean(),
      Message.countDocuments({
        $or: [
          { sender: currentUserObjectId, receiver: otherUserObjectId },
          { sender: otherUserObjectId, receiver: currentUserObjectId },
        ],
      }),
    ]);

    logger.debug(`Found ${messages.length} messages`);

    // Decrypt messages
    const decryptedMessages = await Promise.all(
      messages.map(async (msg) => {
        try {
          return {
            ...msg,
            content: msg.isEncrypted
              ? await decryptMessage(msg.content)
              : msg.content,
          };
        } catch (error) {
          logger.error(`Failed to decrypt message ${msg._id}:`, error);
          return {
            ...msg,
            content: "[Decryption Failed]",
          };
        }
      })
    );

    return {
      messages: decryptedMessages,
      totalCount,
    };
  } catch (error) {
    logger.error("Error in getDirectMessagesService:", error);
    throw error;
  }
};
/**
 * Get user's conversations
 */
export const getConversationsService = async (userId, page, limit) => {
  try {
    const conversations = await Conversation.find({
      "participants.userId": userId,
    })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("participants.userId", "username profilePicture")
      .lean();

    // Get last message for each conversation
    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await Message.findOne({
          conversationId: conv._id,
        })
          .sort({ createdAt: -1 })
          .populate("sender", "username profilePicture")
          .lean();

        return {
          ...conv,
          lastMessage: lastMessage
            ? {
                ...lastMessage,
                content: lastMessage.isEncrypted
                  ? await decryptMessage(lastMessage.content)
                  : lastMessage.content,
              }
            : null,
        };
      })
    );

    return {
      conversations: conversationsWithLastMessage,
      totalCount: await Conversation.countDocuments({
        "participants.userId": userId,
      }),
      page,
      limit,
    };
  } catch (error) {
    logger.error("Error in getConversationsService:", error);
    throw error;
  }
};

/**
 * React to a message
 */
export const reactToMessageService = async (messageId, userId, emoji) => {
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new NotFoundError("Message not found");
    }

    // Check if user already reacted
    const existingReaction = message.reactions.find(
      (r) => r.userId.toString() === userId
    );

    if (existingReaction) {
      existingReaction.emoji = emoji;
    } else {
      message.reactions.push({
        userId,
        emoji,
        createdAt: new Date(),
      });
    }

    await message.save();

    // Notify other participants
    emitSocketEvent(`message:${messageId}`, "message_reaction", {
      messageId,
      userId,
      emoji,
    });

    return message;
  } catch (error) {
    logger.error("Error in reactToMessageService:", error);
    throw error;
  }
};

/**
 * Get message reactions
 */
export const getMessageReactionsService = async (messageId) => {
  try {
    const message = await Message.findById(messageId)
      .populate('reactions.userId', 'username profilePicture')
      .select('reactions');

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    return message.reactions;
  } catch (error) {
    logger.error('Error in getMessageReactionsService:', error);
    throw error;
  }
};

/**
 * Reply to thread
 */
export const replyToThreadService = async ({
  parentMessageId,
  senderId,
  content,
  type = "text",
  media = [],
}) => {
  try {
    const parentMessage = await Message.findById(parentMessageId);
    if (!parentMessage) {
      throw new NotFoundError("Parent message not found");
    }

    // Handle media uploads first
    let mediaUrls = [];
    if (media && media.length > 0) {
      mediaUrls = await Promise.all(media.map((file) => uploadToCloud(file)));
    }

    // Encrypt the reply content
    const encryptedContent = await encryptMessage(content);
    const [salt, iv, tag] = encryptedContent.split(":"); // Extract encryption metadata

    const reply = await Message.create({
      conversationId: parentMessage.conversationId,
      sender: senderId,
      receiver:
        parentMessage.sender.toString() === senderId
          ? parentMessage.receiver
          : parentMessage.sender,
      content: encryptedContent,
      messageType: type,
      media: mediaUrls,
      parentMessageId,
      isReply: true,
      isEncrypted: true,
      encryptionMetadata: {
        algorithm: "aes-256-gcm",
        salt,
        iv,
        tag,
      },
    });

    // Update parent message
    parentMessage.replies.push(reply._id);
    await parentMessage.save();

    // For immediate response, use the unencrypted content
    const decryptedReply = {
      ...reply.toObject(),
      content, // Original unencrypted content
    };

    // Emit socket event with decrypted content
    emitSocketEvent(
      `conversation:${parentMessage.conversationId}`,
      "new_reply",
      {
        reply: decryptedReply,
        parentMessageId,
      }
    );

    return reply;
  } catch (error) {
    logger.error("Error in replyToThreadService:", error);
    throw error;
  }
};

/**
 * Star/Unstar message
 */
export const starMessageService = async (messageId, userId) => {
  try {
    // Find message and check if it exists
    const message = await Message.findById(messageId);
    if (!message) {
      throw new NotFoundError("Message not found");
    }

    // Initialize starredBy if it doesn't exist
    if (!Array.isArray(message.starredBy)) {
      message.starredBy = [];
    }

    // Check if message is already starred by user
    const userIdStr = userId.toString();
    const isStarred = message.starredBy.some(
      (id) => id.toString() === userIdStr
    );

    if (isStarred) {
      // Remove star
      message.starredBy = message.starredBy.filter(
        (id) => id.toString() !== userIdStr
      );
    } else {
      // Add star
      message.starredBy.push(userId);
    }

    // Update isStarred flag
    message.isStarred = message.starredBy.length > 0;

    await message.save();

    return {
      messageId: message._id,
      isStarred: message.isStarred,
    };
  } catch (error) {
    logger.error("Error in starMessageService:", error);
    throw error;
  }
};
/**
 * Get starred messages
 */
export const getStarredMessagesService = async (userId, page, limit) => {
  try {
    const skip = (page - 1) * limit;

    const messages = await Message.find({ starredBy: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'username profilePicture');

    const total = await Message.countDocuments({ starredBy: userId });

    return {
      messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalMessages: total
      }
    };
  } catch (error) {
    logger.error('Error in getStarredMessagesService:', error);
    throw error;
  }
};

/**
 * Update message status
 */
export const updateMessageStatusService = async (messageId, userId, status) => {
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new NotFoundError("Message not found");
    }

    // Update status
    if (status === "read") {
      // Add to readBy if not already present
      if (!message.readBy.some((read) => read.userId.equals(userId))) {
        message.readBy.push({
          userId,
          readAt: new Date(),
        });
      }
    } else if (status === "delivered") {
      // Add to deliveredTo if not already present
      if (
        !message.deliveredTo.some((delivery) => delivery.userId.equals(userId))
      ) {
        message.deliveredTo.push({
          userId,
          deliveredAt: new Date(),
        });
      }
    }

    message.status = status;
    await message.save();

    // Notify sender that message was read/delivered
    emitSocketEvent(`user:${message.sender}`, "message_status_updated", {
      messageId,
      status,
      updatedBy: userId,
    });

    return message;
  } catch (error) {
    logger.error("Error in updateMessageStatusService:", error);
    throw error;
  }
};

/**
 * Send disappearing message
 */
// In chat-service/src/services/messageService.js
export const sendDisappearingMessageService = async ({ 
  senderId, 
  receiverId, 
  content, 
  duration, 
  type = 'text', 
  media 
}) => {
  try {
    // Find or create conversation
    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    let conversation = await Conversation.findOne({
      participants: { $all: [senderObjectId, receiverObjectId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [
          { userId: senderObjectId, role: 'member' },
          { userId: receiverObjectId, role: 'member' }
        ],
        type: 'direct'
      });
    }

    // Upload media if any
    let mediaUrls = [];
    if (media && media.length > 0) {
      mediaUrls = await Promise.all(media.map(file => uploadToCloud(file)));
    }

    // Encrypt the message content
    const encryptedContent = await encryptMessage(content);

    // Create message with encrypted content
    const message = await Message.create({
      conversationId: conversation._id,
      sender: senderId,
      receiver: receiverId,
      content: encryptedContent,
      type,
      media: mediaUrls,
      isEncrypted: true,
      disappearingMessage: {
        enabled: true,
        duration: duration || 30 // Default 30 seconds if not specified
      }
    });

    // Schedule message deletion
    setTimeout(async () => {
      await Message.deleteOne({ _id: message._id });
      // Delete media files
      if (mediaUrls.length > 0) {
        await Promise.all(mediaUrls.map(url => deleteFromCloud(url)));
      }
      // Notify participants about message expiration
      emitSocketEvent(`user:${receiverId}`, 'message_expired', { messageId: message._id });
      emitSocketEvent(`user:${senderId}`, 'message_expired', { messageId: message._id });
    }, (duration || 30) * 1000);

    // Return decrypted content for immediate use
    const messageToReturn = {
      ...message.toObject(),
      content, // Original unencrypted content for immediate display
    };

    // Emit new message event with decrypted content
    emitSocketEvent(`user:${receiverId}`, 'new_disappearing_message', {
      message: messageToReturn,
    });

    return messageToReturn;

  } catch (error) {
    logger.error('Error in sendDisappearingMessageService:', error);
    throw error;
  }
};

/**
 * Mention users in message
 */
export const mentionUserService = async (messageId, userIds, mentionerId) => {
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new NotFoundError("Message not found");
    }

    // Only push the userIds as ObjectIds
    message.mentions.push(...userIds);
    await message.save();

    // Notify mentioned users
    userIds.forEach((userId) => {
      emitSocketEvent(`user:${userId}`, "mentioned", {
        messageId,
        mentionedBy: mentionerId,
      });
    });

    return message;
  } catch (error) {
    logger.error("Error in mentionUserService:", error);
    throw error;
  }
};

/**
 * Edit message
 */
export const editMessageService = async (messageId, userId, content) => {
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new NotFoundError('Message not found');
    }

    if (message.senderId.toString() !== userId) {
      throw new PermissionError('Not authorized to edit this message');
    }

    // Store original content in history
    message.editHistory.push({
      content: message.content,
      editedAt: new Date()
    });

    // Update content
    message.content = await encryptMessage(content);
    message.isEdited = true;
    message.lastEditedAt = new Date();

    await message.save();

    // Notify conversation participants
    emitSocketEvent(`conversation:${message.conversationId}`, 'message_edited', {
      messageId,
      editor: userId
    });

    return message;
  } catch (error) {
    logger.error('Error in editMessageService:', error);
    throw error;
  }
};

/**
 * Delete message
 */
export const deleteMessageService = async (messageId, userId) => {
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new NotFoundError('Message not found');
    }

    if (message.senderId.toString() !== userId) {
      throw new PermissionError('Not authorized to delete this message');
    }

    // Delete media files if any
    if (message.media && message.media.length > 0) {
      await Promise.all(message.media.map(url => deleteFromCloud(url)));
    }

    await Message.deleteOne({ _id: messageId });

    // Notify conversation participants
    emitSocketEvent(`conversation:${message.conversationId}`, 'message_deleted', {
      messageId,
      deletedBy: userId
    });

    return { message: 'Message deleted successfully' };
  } catch (error) {
    logger.error('Error in deleteMessageService:', error);
    throw error;
  }
};

/**
 * Delete conversation
 */
export const deleteConversationService = async (userId, otherUserId) => {
  try {
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] }
    });

    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    // Delete all messages in conversation
    const messages = await Message.find({ conversationId: conversation._id });
    
    // Delete media files
    const mediaUrls = messages.flatMap(msg => msg.media || []);
    if (mediaUrls.length > 0) {
      await Promise.all(mediaUrls.map(url => deleteFromCloud(url)));
    }

    // Delete messages and conversation
    await Message.deleteMany({ conversationId: conversation._id });
    await Conversation.deleteOne({ _id: conversation._id });

    return { message: 'Conversation deleted successfully' };
  } catch (error) {
    logger.error('Error in deleteConversationService:', error);
    throw error;
  }
};

/**
 * Send message request to user
 */
export const sendMessageRequestService = async (senderId, receiverId) => {
  try {
    // Check if request already exists
    const existingRequest = await MessageRequest.findOne({
      senderId,
      receiverId,
      'status.current': 'pending'
    });

    if (existingRequest) {
      throw new ValidationError('Message request already pending');
    }

    // Create new request
    const request = await MessageRequest.create({
      senderId,
      receiverId,
      content: {
        message: 'Would like to message you'
      },
      status: {
        current: 'pending',
        history: [{
          status: 'pending',
          timestamp: new Date()
        }]
      }
    });

    // Emit socket event
    emitSocketEvent(`user:${receiverId}`, 'message_request', {
      requestId: request._id,
      senderId
    });

    return request;
  } catch (error) {
    logger.error('Error in sendMessageRequestService:', error);
    throw error;
  }
};

/**
 * Get message requests for a user
 */
export const getMessageRequestsService = async (userId, page, limit) => {
  try {
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      MessageRequest.find({
        receiverId: userId,
        'status.current': 'pending'
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('senderId', 'username profilePicture'),
      MessageRequest.countDocuments({
        receiverId: userId,
        'status.current': 'pending'
      })
    ]);

    return {
      requests,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRequests: total
      }
    };
  } catch (error) {
    logger.error('Error in getMessageRequestsService:', error);
    throw error;
  }
};

/**
 * Accept message request
 */
export const acceptMessageRequestService = async (requestId, userId) => {
  const session = await MessageRequest.startSession();
  try {
    session.startTransaction();

    // Find and validate request
    const request = await MessageRequest.findOne({
      _id: requestId,
      receiverId: userId,
      'status.current': 'pending'
    }).session(session);

    if (!request) {
      throw new NotFoundError('Message request not found');
    }

    // Update request status
    request.status = {
      current: 'accepted',
      history: [
        ...request.status.history,
        {
          status: 'accepted',
          timestamp: new Date()
        }
      ]
    };
    await request.save();

    // Create or get conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, request.senderId] }
    }).session(session);

    if (!conversation) {
      conversation = await Conversation.create([{
        participants: [userId, request.senderId],
        type: 'direct'
      }], { session });
    }

    await session.commitTransaction();
    return conversation;

  } catch (error) {
    await session.abortTransaction();
    logger.error('Error in acceptMessageRequestService:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Reject message request
 */
export const rejectMessageRequestService = async (requestId, userId) => {
  try {
    const request = await MessageRequest.findOne({
      _id: requestId,
      receiverId: userId,
      'status.current': 'pending'
    });

    if (!request) {
      throw new NotFoundError('Message request not found');
    }

    request.status = {
      current: 'rejected',
      history: [
        ...request.status.history,
        {
          status: 'rejected',
          timestamp: new Date()
        }
      ]
    };

    await request.save();

    // Notify sender
    emitSocketEvent(`user:${request.senderId}`, 'message_request_rejected', {
      requestId,
      rejectedBy: userId
    });

    return { message: 'Request rejected successfully' };
  } catch (error) {
    logger.error('Error in rejectMessageRequestService:', error);
    throw error;
  }
};

/**
 * Schedule message
 */
export const scheduleMessageService = async ({
  senderId,
  recipients,
  content,
  scheduledFor,
  timezone,
  recurrence,
  media,
}) => {
  try {
    // Validate scheduling time
    const scheduledDate = new Date(scheduledFor);
    if (scheduledDate <= new Date()) {
      throw new ValidationError("Schedule time must be in the future");
    }

    // Handle media uploads if any
    let mediaUrls = [];
    if (media && media.length > 0) {
      mediaUrls = await Promise.all(media.map((file) => uploadToCloud(file)));
    }

    // Encrypt the content
    const encryptedContent = await encryptMessage(content);

    // Create scheduled message
    const scheduledMessage = await ScheduledMessage.create({
      senderId,
      recipients,
      content: {
        text: encryptedContent,
        media: mediaUrls.map((url) => ({
          type: "image",
          url,
        })),
        isEncrypted: true,
      },
      schedule: {
        scheduledFor: scheduledDate,
        timezone,
        recurrence,
      },
      delivery: {
        status: "scheduled",
      },
    });

    return scheduledMessage;
  } catch (error) {
    logger.error("Error in scheduleMessageService:", error);
    throw error;
  }
};

/**
 * Get scheduled messages
 */
export const getScheduledMessagesService = async (
  userId,
  { page, limit, status }
) => {
  try {
    const query = {
      senderId: userId,
    };

    if (status) {
      query["delivery.status"] = status;
    }

    const [messages, total] = await Promise.all([
      ScheduledMessage.find(query)
        .sort({ "schedule.scheduledFor": 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("recipients.users", "username profilePicture")
        .populate("recipients.groups", "name")
        .populate("recipients.channels", "name")
        .lean(),
      ScheduledMessage.countDocuments(query),
    ]);

    // Decrypt messages
    const decryptedMessages = await Promise.all(
      messages.map(async (msg) => {
        try {
          return {
            ...msg,
            content: {
              ...msg.content,
              text: msg.content.isEncrypted
                ? await decryptMessage(msg.content.text)
                : msg.content.text,
            },
          };
        } catch (error) {
          logger.error(
            `Failed to decrypt scheduled message ${msg._id}:`,
            error
          );
          return {
            ...msg,
            content: {
              ...msg.content,
              text: "[Decryption Failed]",
            },
          };
        }
      })
    );

    return {
      messages: decryptedMessages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalMessages: total,
      },
    };
  } catch (error) {
    logger.error("Error in getScheduledMessagesService:", error);
    throw error;
  }
};

/**
 * Update scheduled message
 */
export const updateScheduledMessageService = async (messageId, userId, updates) => {
  try {
    const message = await ScheduledMessage.findOne({
      _id: messageId,
      senderId: userId,
      'delivery.status': 'scheduled'
    });

    if (!message) {
      throw new NotFoundError('Scheduled message not found');
    }

    // Handle media updates if any
    if (updates.media) {
      // Delete old media
      if (message.content.media?.length > 0) {
        await Promise.all(message.content.media.map(m => deleteFromCloud(m.url)));
      }

      // Upload new media
      const mediaUrls = await Promise.all(updates.media.map(file => uploadToCloud(file)));
      updates.content = {
        ...updates.content,
        media: mediaUrls.map(url => ({
          type: 'image',
          url
        }))
      };
    }

    Object.assign(message, updates);
    await message.save();

    return message;
  } catch (error) {
    logger.error('Error in updateScheduledMessageService:', error);
    throw error;
  }
};

/**
 * Cancel scheduled message
 */
export const cancelScheduledMessageService = async (messageId, userId) => {
  try {
    const message = await ScheduledMessage.findOne({
      _id: messageId,
      senderId: userId,
      'delivery.status': 'scheduled'
    });

    if (!message) {
      throw new NotFoundError('Scheduled message not found');
    }

    message.delivery.status = 'cancelled';
    message.delivery.attempts.push({
      timestamp: new Date(),
      status: 'cancelled'
    });

    await message.save();

    return { message: 'Scheduled message cancelled successfully' };
  } catch (error) {
    logger.error('Error in cancelScheduledMessageService:', error);
    throw error;
  }
};
/**
 * Remove reaction from a message
 */
export const removeReactionService = async (messageId, userId) => {
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new NotFoundError('Message not found');
    }

    // Remove the reaction
    const reactionIndex = message.reactions.findIndex(
      reaction => reaction.userId.toString() === userId
    );

    if (reactionIndex === -1) {
      throw new ValidationError('No reaction found from this user');
    }

    message.reactions.splice(reactionIndex, 1);
    await message.save();

    // Notify other participants
    emitSocketEvent(`message:${messageId}`, 'reaction_removed', {
      messageId,
      userId
    });

    return { message: 'Reaction removed successfully' };
  } catch (error) {
    logger.error('Error in removeReactionService:', error);
    throw error;
  }
};

// In messageService.js
export const processScheduledMessages = async () => {
  try {
    const now = new Date();
    
    // Find all messages that should be sent
    const messagesToSend = await ScheduledMessage.find({
      'schedule.scheduledFor': { $lte: now },
      'delivery.status': 'scheduled'
    });

    for (const message of messagesToSend) {
      try {
        // Send the message
        await sendDirectMessageService({
          senderId: message.senderId,
          receiverId: message.recipients.users[0], // Assuming single recipient
          content: await decryptMessage(message.content.text),
          type: 'text',
          media: message.content.media
        });

        // Update message status
        message.delivery.status = 'sent';
        message.delivery.attempts.push({
          timestamp: new Date(),
          status: 'sent'
        });
        await message.save();

      } catch (error) {
        logger.error(`Failed to process scheduled message ${message._id}:`, error);
        message.delivery.status = 'failed';
        message.delivery.attempts.push({
          timestamp: new Date(),
          status: 'failed',
          error: error.message
        });
        await message.save();
      }
    }
  } catch (error) {
    logger.error('Error processing scheduled messages:', error);
    throw error;
  }
};