// src/controllers/messageController.js
import {
  sendDirectMessageService,
  getDirectMessagesService,
  getConversationsService,
  reactToMessageService,
  removeReactionService,
  getMessageReactionsService,
  replyToThreadService,
  starMessageService,
  getStarredMessagesService,
  updateMessageStatusService,
  sendDisappearingMessageService,
  mentionUserService,
  editMessageService,
  deleteMessageService,
  deleteConversationService,
  sendMessageRequestService,
  getMessageRequestsService,
  acceptMessageRequestService,
  rejectMessageRequestService,
  scheduleMessageService,
  getScheduledMessagesService,
  updateScheduledMessageService,
  cancelScheduledMessageService,
} from "../services/messageService.js";
import logger from "../utils/logger.js";
import {
  ValidationError
} from "../utils/errors.js";

export const sendDirectMessage = async (req, res) => {
  try {
    // CHANGE THIS PART
    // Instead of using req.user._id
    const senderId = req.user.id; // Keep using .id since it's provided by auth middleware

    const { userId: receiverId } = req.params;
    const { content, type = "text", media } = req.body;

    logger.debug("Sending message:", {
      senderId,
      receiverId,
      type
    });

    const message = await sendDirectMessageService({
      senderId,
      receiverId,
      content,
      type,
      media
    });

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    logger.error("Error in sendDirectMessage:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const getDirectMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const currentUserId = req.user.id;

    const messages = await getDirectMessagesService(
      currentUserId,
      userId,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    logger.error("Error getting direct messages:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getConversations = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    const conversations = await getConversationsService(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    logger.error("Error getting conversations:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    const reaction = await reactToMessageService(messageId, userId, emoji);

    res.status(200).json({
      success: true,
      data: reaction,
    });
  } catch (error) {
    logger.error("Error reacting to message:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    await removeReactionService(messageId, userId);

    res.status(200).json({
      success: true,
      message: "Reaction removed successfully",
    });
  } catch (error) {
    logger.error("Error removing reaction:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getMessageReactions = async (req, res) => {
  try {
    const { messageId } = req.params;
    const reactions = await getMessageReactionsService(messageId);

    res.status(200).json({
      success: true,
      data: reactions
    });
  } catch (error) {
    logger.error('Error getting message reactions:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const replyToThread = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content, type = "text", media } = req.body;
    const userId = req.user.id;

    const reply = await replyToThreadService({
      parentMessageId: messageId,
      senderId: userId,
      content,
      type,
      media
    });

    res.status(201).json({
      success: true,
      data: reply
    });
  } catch (error) {
    logger.error('Error replying to thread:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const starMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await starMessageService(messageId, userId);

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    logger.error('Error starring message:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const getStarredMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    const messages = await getStarredMessagesService(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    logger.error('Error getting starred messages:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    await updateMessageStatusService(messageId, userId, status);

    res.status(200).json({
      success: true,
      message: 'Message status updated successfully'
    });
  } catch (error) {
    logger.error('Error updating message status:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const sendDisappearingMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { content, type = "text", media, duration } = req.body;
    const senderId = req.user.id;

    const message = await sendDisappearingMessageService({
      senderId,
      receiverId: userId,
      content,
      type,
      media,
      duration
    });

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    logger.error('Error sending disappearing message:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const mentionUser = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userIds } = req.body;
    const mentionerId = req.user.id;

    const message = await mentionUserService(messageId, userIds, mentionerId);

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    logger.error('Error mentioning users:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const message = await editMessageService(messageId, userId, content);

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    logger.error('Error editing message:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    await deleteMessageService(messageId, userId);

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting message:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    await deleteConversationService(currentUserId, userId);

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting conversation:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const sendMessageRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    const request = await sendMessageRequestService(senderId, receiverId);

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    logger.error('Error sending message request:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const getMessageRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const requests = await getMessageRequestsService(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    logger.error('Error getting message requests:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const acceptMessageRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const conversation = await acceptMessageRequestService(requestId, userId);

    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    logger.error('Error accepting message request:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const rejectMessageRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    await rejectMessageRequestService(requestId, userId);

    res.status(200).json({
      success: true,
      message: 'Message request rejected successfully'
    });
  } catch (error) {
    logger.error('Error rejecting message request:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Schedule a message for future delivery
 */
export const scheduleMessage = async (req, res) => {
  try {
    const {
      recipients,
      content,
      scheduledFor,
      timezone = "UTC",
      recurrence,
      media
    } = req.body;
    const senderId = req.user.id;

    // Validate request
    if (!recipients || !content || !scheduledFor) {
      throw new ValidationError("Missing required fields");
    }

    const scheduledMessage = await scheduleMessageService({
      senderId,
      recipients,
      content,
      scheduledFor,
      timezone,
      recurrence,
      media
    });

    res.status(201).json({
      success: true,
      message: "Message scheduled successfully",
      data: scheduledMessage
    });
  } catch (error) {
    logger.error('Error scheduling message:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all scheduled messages for a user
 */
export const getScheduledMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;

    const scheduledMessages = await getScheduledMessagesService(
      userId,
      {
        page: parseInt(page),
        limit: parseInt(limit),
        status
      }
    );

    res.status(200).json({
      success: true,
      data: scheduledMessages
    });
  } catch (error) {
    logger.error('Error getting scheduled messages:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update a scheduled message
 */
export const updateScheduledMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    // Validate the updates object
    if (Object.keys(updates).length === 0) {
      throw new ValidationError("No updates provided");
    }

    const updatedMessage = await updateScheduledMessageService(
      messageId,
      userId,
      updates
    );

    res.status(200).json({
      success: true,
      message: "Scheduled message updated successfully",
      data: updatedMessage
    });
  } catch (error) {
    logger.error('Error updating scheduled message:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Cancel a scheduled message
 */
export const cancelScheduledMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    await cancelScheduledMessageService(messageId, userId);

    res.status(200).json({
      success: true,
      message: "Scheduled message cancelled successfully"
    });
  } catch (error) {
    logger.error('Error cancelling scheduled message:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};