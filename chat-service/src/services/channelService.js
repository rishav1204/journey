// src/services/channelServices.js
import Channel from "../database/models/Channel.js";
import Message from "../database/models/Message.js";
import Note from "../database/models/Note.js";
import { NotFoundError, PermissionError } from "../utils/errors.js";
import { emitSocketEvent } from "../utils/socketEvents.js";
import logger from "../utils/logger.js";

export const createChannelService = async ({
  name,
  description,
  category,
  type,
  contentType,
  creatorId,
}) => {
  try {
    const channel = await Channel.create({
      name,
      description,
      category,
      type,
      contentType,
      creator: creatorId,
      members: [
        {
          userId: creatorId,
          role: "owner",
          permissions: {
            canPost: true,
            canModerate: true,
            canInvite: true,
          },
        },
      ],
    });

    return channel.populate("creator", "username profilePicture");
  } catch (error) {
    logger.error("Error in createChannelService:", error);
    throw error;
  }
};

export const getChannelService = async (channelId, userId) => {
  try {
    const channel = await Channel.findById(channelId)
      .populate("creator", "username profilePicture")
      .populate("members.userId", "username profilePicture");

    if (!channel) {
      throw new NotFoundError("Channel not found");
    }

    // Check if user has access to channel
    if (channel.type === "private") {
      const isMember = channel.members.some(
        (member) => member.userId._id.toString() === userId
      );

      if (!isMember) {
        throw new PermissionError("Not authorized to view this channel");
      }
    }

    return channel;
  } catch (error) {
    logger.error("Error in getChannelService:", error);
    throw error;
  }
};

export const updateChannelService = async (channelId, updateData, userId) => {
  try {
    const channel = await Channel.findById(channelId);
    if (!channel) {
      throw new NotFoundError("Channel not found");
    }

    // Check if user has permission to update
    const member = channel.members.find((m) => m.userId.toString() === userId);
    if (!member || !["owner", "admin"].includes(member.role)) {
      throw new PermissionError("Not authorized to update channel");
    }

    // Update allowed fields
    const allowedUpdates = ["name", "description", "category", "settings"];
    Object.keys(updateData).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        channel[key] = updateData[key];
      }
    });

    await channel.save();
    return channel.populate("creator", "username profilePicture");
  } catch (error) {
    logger.error("Error in updateChannelService:", error);
    throw error;
  }
};

export const deleteChannelService = async (channelId, userId) => {
  try {
    const channel = await Channel.findById(channelId);
    if (!channel) {
      throw new NotFoundError("Channel not found");
    }

    // Only owner can delete channel
    if (channel.creator.toString() !== userId) {
      throw new PermissionError("Only channel owner can delete the channel");
    }

    // Delete all channel messages
    await Message.deleteMany({ channelId });

    // Delete the channel
    await channel.deleteOne();

    // Notify members
    channel.members.forEach((member) => {
      emitSocketEvent(`user:${member.userId}`, "channel_deleted", {
        channelId,
        name: channel.name,
      });
    });
  } catch (error) {
    logger.error("Error in deleteChannelService:", error);
    throw error;
  }
};

// ...previous services...

export const listChannelsService = async ({ userId, page, limit, category, type }) => {
  try {
    const query = type ? { type } : {};
    if (category) query.category = category;

    const channels = await Channel.find(query)
      .or([
        { type: 'public' },
        { 'members.userId': userId }
      ])
      .populate('creator', 'username profilePicture')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Channel.countDocuments(query);

    return {
      channels,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Error in listChannelsService:', error);
    throw error;
  }
};

export const getChannelMessagesService = async ({ channelId, userId, page, limit }) => {
  try {
    const channel = await Channel.findById(channelId);
    if (!channel) throw new NotFoundError('Channel not found');

    if (channel.type === 'private') {
      const isMember = channel.members.some(m => m.userId.toString() === userId);
      if (!isMember) throw new PermissionError('Not authorized to view messages');
    }

    const messages = await Message.find({ channelId })
      .populate('sender', 'username profilePicture')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Message.countDocuments({ channelId });

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Error in getChannelMessagesService:', error);
    throw error;
  }
};

export const sendMessageService = async ({ channelId, userId, content, contentType }) => {
  try {
    const channel = await Channel.findById(channelId);
    if (!channel) throw new NotFoundError('Channel not found');

    const member = channel.members.find(m => m.userId.toString() === userId);
    if (!member?.permissions.canPost) {
      throw new PermissionError('Not authorized to post messages');
    }

    const message = await Message.create({
      channelId,
      sender: userId,
      content,
      contentType
    });

    const populatedMessage = await message.populate('sender', 'username profilePicture');

    // Notify channel members
    channel.members.forEach(member => {
      emitSocketEvent(`user:${member.userId}`, 'new_message', populatedMessage);
    });

    return populatedMessage;
  } catch (error) {
    logger.error('Error in sendMessageService:', error);
    throw error;
  }
};

export const getChannelMembersService = async ({ channelId, userId, page, limit }) => {
  try {
    const channel = await Channel.findById(channelId)
      .populate('members.userId', 'username profilePicture')
      .select('members');

    if (!channel) throw new NotFoundError('Channel not found');

    const members = channel.members;
    const startIndex = (page - 1) * limit;
    const paginatedMembers = members.slice(startIndex, startIndex + limit);

    return {
      members: paginatedMembers,
      pagination: {
        page,
        limit,
        total: members.length,
        pages: Math.ceil(members.length / limit)
      }
    };
  } catch (error) {
    logger.error('Error in getChannelMembersService:', error);
    throw error;
  }
};

export const addMemberService = async ({ channelId, memberId, role, adminId }) => {
  try {
    const channel = await Channel.findById(channelId);
    if (!channel) throw new NotFoundError('Channel not found');

    const admin = channel.members.find(m => m.userId.toString() === adminId);
    if (!admin?.permissions.canInvite) {
      throw new PermissionError('Not authorized to add members');
    }

    if (channel.members.some(m => m.userId.toString() === memberId)) {
      throw new Error('User is already a member');
    }

    channel.members.push({
      userId: memberId,
      role: role || 'member',
      permissions: {
        canPost: true,
        canModerate: role === 'admin',
        canInvite: role === 'admin'
      }
    });

    await channel.save();
    return channel.members[channel.members.length - 1];
  } catch (error) {
    logger.error('Error in addMemberService:', error);
    throw error;
  }
};

export const removeMemberService = async ({ channelId, memberId, adminId }) => {
  try {
    const channel = await Channel.findById(channelId);
    if (!channel) throw new NotFoundError('Channel not found');

    const admin = channel.members.find(m => m.userId.toString() === adminId);
    if (!admin?.permissions.canModerate) {
      throw new PermissionError('Not authorized to remove members');
    }

    const memberIndex = channel.members.findIndex(m => m.userId.toString() === memberId);
    if (memberIndex === -1) throw new Error('Member not found');

    channel.members.splice(memberIndex, 1);
    await channel.save();

    emitSocketEvent(`user:${memberId}`, 'removed_from_channel', { channelId });
  } catch (error) {
    logger.error('Error in removeMemberService:', error);
    throw error;
  }
};

export const leaveChannelService = async ({ channelId, userId }) => {
  try {
    const channel = await Channel.findById(channelId);
    if (!channel) throw new NotFoundError('Channel not found');

    const memberIndex = channel.members.findIndex(m => m.userId.toString() === userId);
    if (memberIndex === -1) throw new Error('Not a member of this channel');

    if (channel.members[memberIndex].role === 'owner') {
      throw new Error('Channel owner cannot leave. Transfer ownership first.');
    }

    channel.members.splice(memberIndex, 1);
    await channel.save();
  } catch (error) {
    logger.error('Error in leaveChannelService:', error);
    throw error;
  }
};

export const subscribeToChannelService = async ({ channelId, userId }) => {
  try {
    const channel = await Channel.findById(channelId);
    if (!channel) throw new NotFoundError('Channel not found');

    if (channel.type === 'private') {
      throw new PermissionError('Cannot subscribe to private channels');
    }

    if (channel.subscribers.includes(userId)) {
      throw new Error('Already subscribed');
    }

    channel.subscribers.push(userId);
    await channel.save();

    return { subscribed: true };
  } catch (error) {
    logger.error('Error in subscribeToChannelService:', error);
    throw error;
  }
};

export const broadcastMessageService = async ({ channelId, userId, content, contentType }) => {
  try {
    const channel = await Channel.findById(channelId);
    if (!channel) throw new NotFoundError('Channel not found');

    const member = channel.members.find(m => m.userId.toString() === userId);
    if (!member?.permissions.canPost) {
      throw new PermissionError('Not authorized to broadcast messages');
    }

    const broadcast = await Message.create({
      channelId,
      sender: userId,
      content,
      contentType,
      isBroadcast: true
    });

    // Notify all subscribers and members
    [...new Set([...channel.subscribers, ...channel.members.map(m => m.userId)])].forEach(userId => {
      emitSocketEvent(`user:${userId}`, 'broadcast_message', broadcast);
    });

    return broadcast;
  } catch (error) {
    logger.error('Error in broadcastMessageService:', error);
    throw error;
  }
};

export const createNoteService = async ({ userId, content, expiresIn }) => {
  try {
    const note = await Note.create({
      creator: userId,
      content,
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn) : null
    });

    return note.populate('creator', 'username profilePicture');
  } catch (error) {
    logger.error('Error in createNoteService:', error);
    throw error;
  }
};

export const getNotesService = async ({ userId, page, limit }) => {
  try {
    const notes = await Note.find({
      $or: [
        { creator: userId },
        { visibility: 'public' }
      ],
      expiresAt: { $gt: new Date() }
    })
    .populate('creator', 'username profilePicture')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

    const total = await Note.countDocuments({
      $or: [{ creator: userId }, { visibility: 'public' }],
      expiresAt: { $gt: new Date() }
    });

    return {
      notes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Error in getNotesService:', error);
    throw error;
  }
};

export const deleteNoteService = async ({ noteId, userId }) => {
  try {
    const note = await Note.findById(noteId);
    if (!note) throw new NotFoundError('Note not found');

    if (note.creator.toString() !== userId) {
      throw new PermissionError('Not authorized to delete this note');
    }

    await note.deleteOne();
  } catch (error) {
    logger.error('Error in deleteNoteService:', error);
    throw error;
  }
};
