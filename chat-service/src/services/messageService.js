// src/services/messageService.js
import Message from "../database/models/Message.js";
import Conversation from "../database/models/Conversation.js";
import MessageRequest from "../database/models/MessageRequest.js";
import ScheduledMessage from "../database/models/ScheduledMessage.js";
import {
  NotFoundError,
  ValidationError,
  PermissionError,
} from "../utils/errors.js";
import logger from "../utils/logger.js";
import { uploadToCloud, deleteFromCloud } from "../utils/cloudStorage.js";
import { emitSocketEvent } from "../utils/socketEvents.js";
import { validateMessageContent } from "../utils/messageValidator.js";
import { encryptMessage, decryptMessage } from "../utils/encryption.js";

/**
 * Send a direct message to a user
 */
export const sendDirectMessageService = async ({
  senderId,
  receiverId,
  content,
  type,
  media,
}) => {
  try {
    // Validate message content
    const validationResult = validateMessageContent(content, type);
    if (!validationResult.isValid) {
      throw new ValidationError(validationResult.error);
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        type: "direct",
      });
    }

    // Handle media uploads if any
    let mediaUrls = [];
    if (media && media.length > 0) {
      mediaUrls = await Promise.all(media.map((file) => uploadToCloud(file)));
    }

    // Create and save message
    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      receiverId,
      content: await encryptMessage(content),
      messageType: type,
      media: mediaUrls,
      status: "sent",
    });

    // Emit socket event for real-time update
    emitSocketEvent(`user:${receiverId}`, "new_message", {
      message,
      conversation,
    });

    return message;
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
  page,
  limit
) => {
  try {
    const conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, otherUserId] },
    });

    if (!conversation) {
      return {
        messages: [],
        totalCount: 0,
      };
    }

    const skip = (page - 1) * limit;

    const [messages, totalCount] = await Promise.all([
      Message.find({ conversationId: conversation._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("senderId", "username profilePicture")
        .lean(),
      Message.countDocuments({ conversationId: conversation._id }),
    ]);

    // Decrypt messages
    const decryptedMessages = await Promise.all(
      messages.map(async (msg) => ({
        ...msg,
        content: await decryptMessage(msg.content),
      }))
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
      participants: userId,
    })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("participants", "username profilePicture")
      .lean();

    // Get last message for each conversation
    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await Message.findOne({
          conversationId: conv._id,
        })
          .sort({ createdAt: -1 })
          .lean();

        return {
          ...conv,
          lastMessage: lastMessage
            ? {
                ...lastMessage,
                content: await decryptMessage(lastMessage.content),
              }
            : null,
        };
      })
    );

    return conversationsWithLastMessage;
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
export const replyToThreadService = async ({ parentMessageId, senderId, content, type, media }) => {
  try {
    const parentMessage = await Message.findById(parentMessageId);
    if (!parentMessage) {
      throw new NotFoundError('Parent message not found');
    }

    // Handle media uploads
    let mediaUrls = [];
    if (media && media.length > 0) {
      mediaUrls = await Promise.all(media.map(file => uploadToCloud(file)));
    }

    const reply = await Message.create({
      conversationId: parentMessage.conversationId,
      senderId,
      content: await encryptMessage(content),
      messageType: type,
      media: mediaUrls,
      parentMessageId,
      isReply: true
    });

    // Update parent message
    parentMessage.replies.push(reply._id);
    await parentMessage.save();

    // Emit socket event
    emitSocketEvent(`conversation:${parentMessage.conversationId}`, 'new_reply', {
      reply,
      parentMessageId
    });

    return reply;
  } catch (error) {
    logger.error('Error in replyToThreadService:', error);
    throw error;
  }
};

/**
 * Star/Unstar message
 */
export const starMessageService = async (messageId, userId) => {
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new NotFoundError('Message not found');
    }

    // Toggle star status
    const isStarred = message.starredBy.includes(userId);
    if (isStarred) {
      message.starredBy = message.starredBy.filter(id => id.toString() !== userId);
    } else {
      message.starredBy.push(userId);
    }

    await message.save();
    return message;
  } catch (error) {
    logger.error('Error in starMessageService:', error);
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
      throw new NotFoundError('Message not found');
    }

    // Update status
    message.status = status;
    message.statusUpdates.push({
      status,
      updatedBy: userId,
      timestamp: new Date()
    });

    await message.save();

    // Emit socket event
    emitSocketEvent(`message:${messageId}`, 'status_update', {
      messageId,
      status,
      updatedBy: userId
    });

    return message;
  } catch (error) {
    logger.error('Error in updateMessageStatusService:', error);
    throw error;
  }
};

/**
 * Send disappearing message
 */
export const sendDisappearingMessageService = async ({
  senderId,
  receiverId,
  content,
  type,
  media,
  duration
}) => {
  try {
    // Upload media if any
    let mediaUrls = [];
    if (media && media.length > 0) {
      mediaUrls = await Promise.all(media.map(file => uploadToCloud(file)));
    }

    const message = await Message.create({
      senderId,
      receiverId,
      content: await encryptMessage(content),
      messageType: type,
      media: mediaUrls,
      isDisappearing: true,
      disappearAfter: duration,
      expiresAt: new Date(Date.now() + duration * 1000)
    });

    // Schedule message deletion
    setTimeout(async () => {
      await Message.deleteOne({ _id: message._id });
      // Delete media files
      if (mediaUrls.length > 0) {
        await Promise.all(mediaUrls.map(url => deleteFromCloud(url)));
      }
    }, duration * 1000);

    return message;
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
      throw new NotFoundError('Message not found');
    }

    // Add mentions
    message.mentions.push(...userIds.map(userId => ({
      userId,
      mentionedBy: mentionerId,
      timestamp: new Date()
    })));

    await message.save();

    // Notify mentioned users
    userIds.forEach(userId => {
      emitSocketEvent(`user:${userId}`, 'mentioned', {
        messageId,
        mentionedBy: mentionerId
      });
    });

    return message;
  } catch (error) {
    logger.error('Error in mentionUserService:', error);
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
  media
}) => {
  try {
    // Validate scheduling time
    const scheduledDate = new Date(scheduledFor);
    if (scheduledDate <= new Date()) {
      throw new ValidationError('Schedule time must be in the future');
    }

    // Handle media uploads if any
    let mediaUrls = [];
    if (media && media.length > 0) {
      mediaUrls = await Promise.all(media.map(file => uploadToCloud(file)));
    }

    const scheduledMessage = await ScheduledMessage.create({
      senderId,
      recipients,
      content: {
        text: content,
        media: mediaUrls.map(url => ({
          type: 'image',
          url
        }))
      },
      schedule: {
        scheduledFor: scheduledDate,
        timezone,
        recurrence: recurrence ? {
          pattern: recurrence.pattern,
          endDate: recurrence.endDate
        } : undefined
      }
    });

    return scheduledMessage;
  } catch (error) {
    logger.error('Error in scheduleMessageService:', error);
    throw error;
  }
};

/**
 * Get scheduled messages
 */
export const getScheduledMessagesService = async (userId, { page, limit, status }) => {
  try {
    const query = {
      senderId: userId
    };

    if (status) {
      query['delivery.status'] = status;
    }

    const [messages, total] = await Promise.all([
      ScheduledMessage.find(query)
        .sort({ 'schedule.scheduledFor': 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('recipients.users', 'username profilePicture')
        .populate('recipients.groups', 'name')
        .populate('recipients.channels', 'name'),
      ScheduledMessage.countDocuments(query)
    ]);

    return {
      messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalMessages: total
      }
    };
  } catch (error) {
    logger.error('Error in getScheduledMessagesService:', error);
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
