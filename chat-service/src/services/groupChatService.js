// src/services/groupChatService.js
import Group from "../database/models/Group.js";
import Message from "../database/models/Message.js";
import Poll from "../database/models/Poll.js";
import { NotFoundError, PermissionError } from "../utils/errors.js";
import { emitSocketEvent } from "../utils/socketEvents.js";
import logger from "../utils/logger.js";

export const createGroupService = async ({
  name,
  description,
  members,
  creatorId,
}) => {
  try {
    // Validate group creation
    if (!name || !creatorId) {
      throw new Error("Group name and creator are required");
    }

    const group = await Group.create({
      name,
      description,
      creator: creatorId,
      members: [
        {
          userId: creatorId,
          role: "admin",
          joinedAt: new Date(),
        },
        ...members.map((memberId) => ({
          userId: memberId,
          role: "member",
          joinedAt: new Date(),
        })),
      ],
    });

    // Notify members about group creation
    members.forEach((memberId) => {
      emitSocketEvent(`user:${memberId}`, "group_created", {
        groupId: group._id,
        name: group.name,
      });
    });

    return group.populate("members.userId", "username profilePicture");
  } catch (error) {
    logger.error("Error in createGroupService:", error);
    throw error;
  }
};

export const updateGroupService = async (groupId, updateData, userId) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      throw new NotFoundError("Group not found");
    }

    // Check if user is admin
    const member = group.members.find((m) => m.userId.toString() === userId);
    if (!member || member.role !== "admin") {
      throw new PermissionError("Only admins can update group details");
    }

    // Update allowed fields
    const allowedUpdates = ["name", "description", "settings"];
    Object.keys(updateData).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        group[key] = updateData[key];
      }
    });

    await group.save();

    // Notify members about update
    group.members.forEach((member) => {
      emitSocketEvent(`user:${member.userId}`, "group_updated", {
        groupId: group._id,
        updates: updateData,
      });
    });

    return group.populate("members.userId", "username profilePicture");
  } catch (error) {
    logger.error("Error in updateGroupService:", error);
    throw error;
  }
};

export const deleteGroupService = async (groupId, userId) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      throw new NotFoundError("Group not found");
    }

    // Check if user is admin
    const member = group.members.find((m) => m.userId.toString() === userId);
    if (!member || member.role !== "admin") {
      throw new PermissionError("Only admins can delete the group");
    }

    // Delete all group messages
    await Message.deleteMany({ groupId });

    // Delete all group polls
    await Poll.deleteMany({ groupId });

    // Notify members before deletion
    group.members.forEach((member) => {
      emitSocketEvent(`user:${member.userId}`, "group_deleted", {
        groupId: group._id,
        name: group.name,
      });
    });

    await group.deleteOne();
  } catch (error) {
    logger.error("Error in deleteGroupService:", error);
    throw error;
  }
};

export const addMembersService = async (groupId, members, adminId) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      throw new NotFoundError("Group not found");
    }

    // Check if user is admin
    const admin = group.members.find((m) => m.userId.toString() === adminId);
    if (!admin || admin.role !== "admin") {
      throw new PermissionError("Only admins can add members");
    }

    // Add new members
    const newMembers = members.map((memberId) => ({
      userId: memberId,
      role: "member",
      joinedAt: new Date(),
    }));

    group.members.push(...newMembers);
    await group.save();

    // Notify new members
    members.forEach((memberId) => {
      emitSocketEvent(`user:${memberId}`, "group_joined", {
        groupId: group._id,
        name: group.name,
      });
    });

    return group.populate("members.userId", "username profilePicture");
  } catch (error) {
    logger.error("Error in addMembersService:", error);
    throw error;
  }
};

export const getMembersService = async (groupId, userId) => {
  try {
    const group = await Group.findById(groupId)
      .populate("members.userId", "username profilePicture status")
      .select("members");

    if (!group) {
      throw new NotFoundError("Group not found");
    }

    // Check if user is member
    const isMember = group.members.some(
      (m) => m.userId._id.toString() === userId
    );
    if (!isMember) {
      throw new PermissionError("Not authorized to view group members");
    }

    return group.members;
  } catch (error) {
    logger.error("Error in getMembersService:", error);
    throw error;
  }
};

export const getGroupMessagesService = async ({
  groupId,
  userId,
  page,
  limit,
}) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      throw new NotFoundError("Group not found");
    }

    // Check if user is member
    const isMember = group.members.some((m) => m.userId.toString() === userId);
    if (!isMember) {
      throw new PermissionError("Not authorized to view messages");
    }

    const messages = await Message.find({ groupId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("sender", "username profilePicture");

    const total = await Message.countDocuments({ groupId });

    return {
      messages,
      pagination: {
        current: page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error("Error in getGroupMessagesService:", error);
    throw error;
  }
};

export const sendGroupMessageService = async ({ groupId, userId, content, type }) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) throw new NotFoundError("Group not found");

    const member = group.members.find(m => m.userId.toString() === userId);
    if (!member) throw new PermissionError("Not a group member");

    const message = await Message.create({
      groupId,
      sender: userId,
      content,
      type
    });

    const populatedMessage = await message.populate("sender", "username profilePicture");

    // Notify group members
    group.members.forEach(member => {
      emitSocketEvent(`user:${member.userId}`, "new_group_message", populatedMessage);
    });

    return populatedMessage;
  } catch (error) {
    logger.error("Error in sendGroupMessageService:", error);
    throw error;
  }
};

export const leaveGroupService = async (groupId, userId) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) throw new NotFoundError("Group not found");

    const memberIndex = group.members.findIndex(m => m.userId.toString() === userId);
    if (memberIndex === -1) throw new Error("Not a group member");

    // Check if last admin
    const isAdmin = group.members[memberIndex].role === "admin";
    const adminCount = group.members.filter(m => m.role === "admin").length;
    if (isAdmin && adminCount === 1) {
      throw new Error("Cannot leave group - assign new admin first");
    }

    group.members.splice(memberIndex, 1);
    await group.save();

    // Notify remaining members
    group.members.forEach(member => {
      emitSocketEvent(`user:${member.userId}`, "member_left_group", {
        groupId,
        userId
      });
    });
  } catch (error) {
    logger.error("Error in leaveGroupService:", error);
    throw error;
  }
};

export const removeMemberService = async (groupId, memberId, adminId) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) throw new NotFoundError("Group not found");

    // Verify admin permissions
    const admin = group.members.find(m => m.userId.toString() === adminId);
    if (!admin || admin.role !== "admin") {
      throw new PermissionError("Only admins can remove members");
    }

    const memberIndex = group.members.findIndex(m => m.userId.toString() === memberId);
    if (memberIndex === -1) throw new Error("Member not found");

    group.members.splice(memberIndex, 1);
    await group.save();

    // Notify members
    emitSocketEvent(`user:${memberId}`, "removed_from_group", { groupId });
    group.members.forEach(member => {
      emitSocketEvent(`user:${member.userId}`, "member_removed", {
        groupId,
        memberId
      });
    });
  } catch (error) {
    logger.error("Error in removeMemberService:", error);
    throw error;
  }
};

export const createPollService = async ({ groupId, creatorId, question, options, duration }) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) throw new NotFoundError("Group not found");

    const member = group.members.find(m => m.userId.toString() === creatorId);
    if (!member) throw new PermissionError("Not a group member");

    const poll = await Poll.create({
      groupId,
      creator: creatorId,
      question,
      options: options.map(opt => ({ text: opt, votes: [] })),
      expiresAt: duration ? new Date(Date.now() + duration) : null
    });

    // Notify group members
    group.members.forEach(member => {
      emitSocketEvent(`user:${member.userId}`, "new_poll", poll);
    });

    return poll;
  } catch (error) {
    logger.error("Error in createPollService:", error);
    throw error;
  }
};

export const votePollService = async ({ groupId, pollId, userId, optionId }) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) throw new NotFoundError("Group not found");

    const poll = await Poll.findById(pollId);
    if (!poll) throw new NotFoundError("Poll not found");
    if (poll.expiresAt && poll.expiresAt < new Date()) {
      throw new Error("Poll has expired");
    }

    // Remove existing vote if any
    poll.options.forEach(opt => {
      opt.votes = opt.votes.filter(v => v.toString() !== userId);
    });

    // Add new vote
    const option = poll.options.id(optionId);
    if (!option) throw new Error("Invalid option");
    option.votes.push(userId);

    await poll.save();

    // Notify group members
    group.members.forEach(member => {
      emitSocketEvent(`user:${member.userId}`, "poll_updated", poll);
    });

    return poll;
  } catch (error) {
    logger.error("Error in votePollService:", error);
    throw error;
  }
};

export const unvotePollService = async ({ groupId, pollId, userId }) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) throw new NotFoundError("Group not found");

    const poll = await Poll.findById(pollId);
    if (!poll) throw new NotFoundError("Poll not found");

    // Remove vote
    poll.options.forEach(opt => {
      opt.votes = opt.votes.filter(v => v.toString() !== userId);
    });

    await poll.save();

    // Notify group members
    group.members.forEach(member => {
      emitSocketEvent(`user:${member.userId}`, "poll_updated", poll);
    });

    return poll;
  } catch (error) {
    logger.error("Error in unvotePollService:", error);
    throw error;
  }
};

export const deletePollService = async (groupId, pollId, userId) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) throw new NotFoundError("Group not found");

    const poll = await Poll.findById(pollId);
    if (!poll) throw new NotFoundError("Poll not found");

    // Check permissions
    if (poll.creator.toString() !== userId) {
      const member = group.members.find(m => m.userId.toString() === userId);
      if (!member || member.role !== "admin") {
        throw new PermissionError("Not authorized to delete poll");
      }
    }

    await poll.deleteOne();

    // Notify group members
    group.members.forEach(member => {
      emitSocketEvent(`user:${member.userId}`, "poll_deleted", { pollId });
    });
  } catch (error) {
    logger.error("Error in deletePollService:", error);
    throw error;
  }
};

export const pinMessageService = async (groupId, messageId, userId) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) throw new NotFoundError("Group not found");

    const member = group.members.find(m => m.userId.toString() === userId);
    if (!member || member.role !== "admin") {
      throw new PermissionError("Only admins can pin messages");
    }

    const message = await Message.findOneAndUpdate(
      { _id: messageId, groupId },
      { isPinned: true },
      { new: true }
    ).populate("sender", "username profilePicture");

    if (!message) throw new NotFoundError("Message not found");

    // Notify group members
    group.members.forEach(member => {
      emitSocketEvent(`user:${member.userId}`, "message_pinned", message);
    });

    return message;
  } catch (error) {
    logger.error("Error in pinMessageService:", error);
    throw error;
  }
};

export const unpinMessageService = async (groupId, messageId, userId) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) throw new NotFoundError("Group not found");

    const member = group.members.find(m => m.userId.toString() === userId);
    if (!member || member.role !== "admin") {
      throw new PermissionError("Only admins can unpin messages");
    }

    const message = await Message.findOneAndUpdate(
      { _id: messageId, groupId },
      { isPinned: false },
      { new: true }
    );

    if (!message) throw new NotFoundError("Message not found");

    // Notify group members
    group.members.forEach(member => {
      emitSocketEvent(`user:${member.userId}`, "message_unpinned", { messageId });
    });
  } catch (error) {
    logger.error("Error in unpinMessageService:", error);
    throw error;
  }
};

// ...existing code...

export const getPollsService = async ({ groupId, userId, page, limit }) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) throw new NotFoundError("Group not found");

    // Verify member access
    const isMember = group.members.some(m => m.userId.toString() === userId);
    if (!isMember) throw new PermissionError("Not authorized to view polls");

    const polls = await Poll.find({ groupId })
      .populate('creator', 'username profilePicture')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Poll.countDocuments({ groupId });

    return {
      polls,
      pagination: {
        current: page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error("Error in getPollsService:", error);
    throw error;
  }
};

export const deleteMessageService = async ({ groupId, messageId, userId }) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) throw new NotFoundError("Group not found");

    const message = await Message.findById(messageId);
    if (!message) throw new NotFoundError("Message not found");

    // Check if user is message sender or admin
    const member = group.members.find(m => m.userId.toString() === userId);
    const isAdmin = member?.role === "admin";
    const isSender = message.sender.toString() === userId;

    if (!isAdmin && !isSender) {
      throw new PermissionError("Not authorized to delete this message");
    }

    await message.deleteOne();

    // Notify group members
    group.members.forEach(member => {
      emitSocketEvent(`user:${member.userId}`, "message_deleted", {
        messageId,
        groupId
      });
    });
  } catch (error) {
    logger.error("Error in deleteMessageService:", error);
    throw error;
  }
};

export const deleteAllMessagesService = async ({ groupId, userId }) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) throw new NotFoundError("Group not found");

    // Only admin can delete all messages
    const member = group.members.find(m => m.userId.toString() === userId);
    if (!member || member.role !== "admin") {
      throw new PermissionError("Only admins can delete all messages");
    }

    await Message.deleteMany({ groupId });

    // Notify group members
    group.members.forEach(member => {
      emitSocketEvent(`user:${member.userId}`, "all_messages_deleted", {
        groupId
      });
    });
  } catch (error) {
    logger.error("Error in deleteAllMessagesService:", error);
    throw error;
  }
};

export const editMessageService = async ({ groupId, messageId, userId, content }) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) throw new NotFoundError("Group not found");

    const message = await Message.findById(messageId);
    if (!message) throw new NotFoundError("Message not found");

    // Only message sender can edit
    if (message.sender.toString() !== userId) {
      throw new PermissionError("Can only edit own messages");
    }

    // Update message
    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    const updatedMessage = await message.populate("sender", "username profilePicture");

    // Notify group members
    group.members.forEach(member => {
      emitSocketEvent(`user:${member.userId}`, "message_edited", updatedMessage);
    });

    return updatedMessage;
  } catch (error) {
    logger.error("Error in editMessageService:", error);
    throw error;
  }
};