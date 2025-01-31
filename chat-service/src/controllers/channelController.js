// src/controllers/channelController.js
import {
  createChannelService,
  getChannelService,
  updateChannelService,
  deleteChannelService,
  listChannelsService,
  getChannelMessagesService,
  sendMessageService,
  getChannelMembersService,
  addMemberService,
  removeMemberService,
  leaveChannelService,
  subscribeToChannelService,
  broadcastMessageService,
  createNoteService,
  getNotesService,
  deleteNoteService,
} from "../services/channelServices.js";
import logger from "../utils/logger.js";

export const createChannel = async (req, res) => {
  try {
    const { name, description, category, type, contentType } = req.body;
    const creatorId = req.user.id;

    const channel = await createChannelService({
      name,
      description,
      category,
      type,
      contentType,
      creatorId,
    });

    res.status(201).json({
      success: true,
      data: channel,
    });
  } catch (error) {
    logger.error("Error creating channel:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user.id;

    const channel = await getChannelService(channelId, userId);

    res.status(200).json({
      success: true,
      data: channel,
    });
  } catch (error) {
    logger.error("Error getting channel:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    const updatedChannel = await updateChannelService(
      channelId,
      updateData,
      userId
    );

    res.status(200).json({
      success: true,
      data: updatedChannel,
    });
  } catch (error) {
    logger.error("Error updating channel:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user.id;

    await deleteChannelService(channelId, userId);

    res.status(200).json({
      success: true,
      message: "Channel deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting channel:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const listChannels = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, category, type } = req.query;

    const channels = await listChannelsService({
      userId,
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      type,
    });

    res.status(200).json({
      success: true,
      data: channels,
    });
  } catch (error) {
    logger.error("Error listing channels:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getChannelMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const messages = await getChannelMessagesService({
      channelId,
      userId,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    logger.error("Error getting channel messages:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { content, contentType } = req.body;
    const userId = req.user.id;

    const message = await sendMessageService({
      channelId,
      userId,
      content,
      contentType
    });

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    logger.error('Error sending message:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const getChannelMembers = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    const members = await getChannelMembersService({
      channelId,
      userId,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      data: members
    });
  } catch (error) {
    logger.error('Error getting channel members:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const addMember = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { memberId, role } = req.body;
    const adminId = req.user.id;

    const member = await addMemberService({
      channelId,
      memberId,
      role,
      adminId
    });

    res.status(201).json({
      success: true,
      data: member
    });
  } catch (error) {
    logger.error('Error adding member:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { memberId } = req.body;
    const adminId = req.user.id;

    await removeMemberService({
      channelId,
      memberId,
      adminId
    });

    res.status(200).json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    logger.error('Error removing member:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const leaveChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user.id;

    await leaveChannelService({
      channelId,
      userId
    });

    res.status(200).json({
      success: true,
      message: 'Left channel successfully'
    });
  } catch (error) {
    logger.error('Error leaving channel:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const subscribeToChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user.id;

    const subscription = await subscribeToChannelService({
      channelId,
      userId
    });

    res.status(201).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    logger.error('Error subscribing to channel:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const broadcastMessage = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { content, contentType } = req.body;
    const userId = req.user.id;

    await broadcastMessageService({
      channelId,
      userId,
      content,
      contentType
    });

    res.status(201).json({
      success: true,
      message: 'Broadcast message sent successfully'
    });
  } catch (error) {
    logger.error('Error broadcasting message:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const createNote = async (req, res) => {
  try {
    const { content, expiresIn } = req.body;
    const userId = req.user.id;

    const note = await createNoteService({
      userId,
      content,
      expiresIn
    });

    res.status(201).json({
      success: true,
      data: note
    });
  } catch (error) {
    logger.error('Error creating note:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const getNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const notes = await getNotesService({
      userId,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      data: notes
    });
  } catch (error) {
    logger.error('Error getting notes:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;

    await deleteNoteService({
      noteId,
      userId
    });

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting note:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};
