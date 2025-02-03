import {
  createGroupService,
  updateGroupService,
  deleteGroupService,
  addMembersService,
  getMembersService,
  getGroupMessagesService,
  sendGroupMessageService,
  leaveGroupService,
  removeMemberService,
  createPollService,
  votePollService,
  deletePollService,
  unvotePollService,
  pinMessageService,
  unpinMessageService,
} from "../services/groupChatService.js";
import logger from "../utils/logger.js";

// Group Management Controllers
export const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const creatorId = req.user.id;

    const group = await createGroupService({
      name,
      description,
      members,
      creatorId,
    });

    res.status(201).json({
      success: true,
      data: group,
    });
  } catch (error) {
    logger.error("Error creating group:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    const updatedGroup = await updateGroupService(groupId, updateData, userId);

    res.status(200).json({
      success: true,
      data: updatedGroup,
    });
  } catch (error) {
    logger.error("Error updating group:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    await deleteGroupService(groupId, userId);

    res.status(200).json({
      success: true,
      message: "Group deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting group:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// Member Management Controllers
export const addMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { members } = req.body;
    const adminId = req.user.id;

    const updatedGroup = await addMembersService(groupId, members, adminId);

    res.status(200).json({
      success: true,
      data: updatedGroup,
    });
  } catch (error) {
    logger.error("Error adding members:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const members = await getMembersService(groupId, userId);

    res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    logger.error("Error getting members:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    await leaveGroupService(groupId, userId);

    res.status(200).json({
      success: true,
      message: "Left group successfully",
    });
  } catch (error) {
    logger.error("Error leaving group:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const adminId = req.user.id;

    await removeMemberService(groupId, memberId, adminId);

    res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    logger.error("Error removing member:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// Message Controllers
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;

    const messages = await getGroupMessagesService({
      groupId,
      userId,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    logger.error("Error getting group messages:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content, type = "text" } = req.body;
    const userId = req.user.id;

    const message = await sendGroupMessageService({
      groupId,
      userId,
      content,
      type,
    });

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    logger.error("Error sending group message:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// Poll Controllers
export const createPoll = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { question, options, duration } = req.body;
    const creatorId = req.user.id;

    const poll = await createPollService({
      groupId,
      creatorId,
      question,
      options,
      duration,
    });

    res.status(201).json({
      success: true,
      data: poll,
    });
  } catch (error) {
    logger.error("Error creating poll:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const votePoll = async (req, res) => {
  try {
    const { groupId, pollId } = req.params;
    const { optionId } = req.body;
    const userId = req.user.id;

    const updatedPoll = await votePollService({
      groupId,
      pollId,
      userId,
      optionId,
    });

    res.status(200).json({
      success: true,
      data: updatedPoll,
    });
  } catch (error) {
    logger.error("Error voting on poll:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const unvotePoll = async (req, res) => {
  try {
    const { groupId, pollId } = req.params;
    const userId = req.user.id;

    const updatedPoll = await unvotePollService({
      groupId,
      pollId,
      userId,
    });

    res.status(200).json({
      success: true,
      data: updatedPoll,
    });
  } catch (error) {
    logger.error("Error removing vote from poll:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePoll = async (req, res) => {
  try {
    const { groupId, pollId } = req.params;
    const userId = req.user.id;

    await deletePollService(groupId, pollId, userId);

    res.status(200).json({
      success: true,
      message: "Poll deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting poll:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// Message Pin Controllers
export const pinMessage = async (req, res) => {
  try {
    const { groupId, messageId } = req.params;
    const userId = req.user.id;

    const pinnedMessage = await pinMessageService(groupId, messageId, userId);

    res.status(200).json({
      success: true,
      data: pinnedMessage,
    });
  } catch (error) {
    logger.error("Error pinning message:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const unpinMessage = async (req, res) => {
  try {
    const { groupId, messageId } = req.params;
    const userId = req.user.id;

    await unpinMessageService(groupId, messageId, userId);

    res.status(200).json({
      success: true,
      message: "Message unpinned successfully",
    });
  } catch (error) {
    logger.error("Error unpinning message:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ...existing code...

export const getPolls = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    const polls = await getPollsService({
      groupId,
      userId,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      data: polls
    });
  } catch (error) {
    logger.error('Error getting polls:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { groupId, messageId } = req.params;
    const userId = req.user.id;

    await deleteMessageService({
      groupId,
      messageId,
      userId
    });

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

export const deleteAllMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    await deleteAllMessagesService({
      groupId,
      userId
    });

    res.status(200).json({
      success: true,
      message: 'All messages deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting all messages:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { groupId, messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const updatedMessage = await editMessageService({
      groupId,
      messageId,
      userId,
      content
    });

    res.status(200).json({
      success: true,
      data: updatedMessage
    });
  } catch (error) {
    logger.error('Error editing message:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};