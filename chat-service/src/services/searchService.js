import Message from "../database/models/Message.js";
import Media from "../database/models/Media.js";
import User from "../database/models/User.js";
import Group from "../database/models/Group.js";
import Channel from "../database/models/Channel.js";
import { createSearchQuery, createPagination } from "../utils/searchHelpers.js";
import {
  ValidationError,
  AuthorizationError,
  NotFoundError,
} from "../utils/errors.js";
import logger from "../utils/logger.js";

const validateDateRange = (startDate, endDate) => {
  if ((startDate && !endDate) || (!startDate && endDate)) {
    throw new ValidationError("Both startDate and endDate are required");
  }
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new ValidationError("startDate cannot be later than endDate");
  }
};

export const searchMessagesService = async ({
  userId,
  query,
  startDate,
  endDate,
  type,
  page,
  limit,
}) => {
  try {
    validateDateRange(startDate, endDate);

    const filter = {
      $or: [{ senderId: userId }, { receiverId: userId }],
    };

    if (query) {
      if (typeof query !== "string") {
        throw new ValidationError("Query must be a string");
      }
      filter.content = { $regex: query, $options: "i" };
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (type && type !== "all") {
      filter.type = type;
    }

    const { skip, take } = createPagination(page, limit);

    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(take)
      .populate("senderId", "username avatar")
      .populate("receiverId", "username avatar");

    return {
      data: messages,
      total: await Message.countDocuments(filter),
      page,
      limit,
    };
  } catch (error) {
    logger.error("Search messages error:", { userId, error: error.message });
    throw error;
  }
};

export const searchMediaService = async ({
  userId,
  type,
  startDate,
  endDate,
  page,
  limit,
}) => {
  try {
    validateDateRange(startDate, endDate);

    const filter = { userId };

    if (type) {
      if (!["image", "video", "audio", "document"].includes(type)) {
        throw new ValidationError("Invalid media type");
      }
      filter.mediaType = type;
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const { skip, take } = createPagination(page, limit);

    const media = await Media.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(take);

    if (!media.length) {
      throw new NotFoundError("No media found");
    }

    return {
      data: media,
      total: await Media.countDocuments(filter),
      page,
      limit,
    };
  } catch (error) {
    logger.error("Search media error:", { userId, error: error.message });
    throw error;
  }
};

/**
 * Search messages in a specific chat
 */
export const searchChatService = async ({ userId, chatId, query, page, limit }) => {
  try {
    const filter = {
      $or: [
        { senderId: userId, receiverId: chatId },
        { senderId: chatId, receiverId: userId }
      ]
    };

    if (query) {
      if (typeof query !== 'string') {
        throw new ValidationError('Query must be a string');
      }
      filter.content = { $regex: query, $options: 'i' };
    }

    const { skip, take } = createPagination(page, limit);

    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(take)
      .populate('senderId', 'username avatar')
      .populate('receiverId', 'username avatar');

    return {
      data: messages,
      total: await Message.countDocuments(filter),
      page,
      limit
    };
  } catch (error) {
    logger.error('Search chat messages error:', { userId, chatId, error: error.message });
    throw error;
  }
};

/**
 * Search messages in a group
 */
export const searchGroupService = async ({ userId, groupId, query, page, limit }) => {
  try {
    // First verify user is member of group
    const group = await Group.findOne({
      _id: groupId,
      'members.userId': userId,
      'members.status': 'active'
    });

    if (!group) {
      throw new AuthorizationError('Not authorized to search this group');
    }

    const filter = {
      groupId,
      type: 'group'
    };

    if (query) {
      if (typeof query !== 'string') {
        throw new ValidationError('Query must be a string');
      }
      filter.content = { $regex: query, $options: 'i' };
    }

    const { skip, take } = createPagination(page, limit);

    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(take)
      .populate('senderId', 'username avatar');

    return {
      data: messages,
      total: await Message.countDocuments(filter),
      page,
      limit
    };
  } catch (error) {
    logger.error('Search group messages error:', { userId, groupId, error: error.message });
    throw error;
  }
};

/**
 * Search messages in a channel
 */
export const searchChannelService = async ({ userId, channelId, query, page, limit }) => {
  try {
    // First verify user is subscriber of channel
    const channel = await Channel.findOne({
      _id: channelId,
      $or: [
        { 'subscribers.userId': userId },
        { ownerId: userId },
        { 'moderators.userId': userId }
      ]
    });

    if (!channel) {
      throw new AuthorizationError('Not authorized to search this channel');
    }

    const filter = {
      channelId,
      type: 'channel'
    };

    if (query) {
      if (typeof query !== 'string') {
        throw new ValidationError('Query must be a string');
      }
      filter.content = { $regex: query, $options: 'i' };
    }

    const { skip, take } = createPagination(page, limit);

    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(take)
      .populate('senderId', 'username avatar');

    return {
      data: messages,
      total: await Message.countDocuments(filter),
      page,
      limit
    };
  } catch (error) {
    logger.error('Search channel messages error:', { userId, channelId, error: error.message });
    throw error;
  }
};

/**
 * Search users in contact list
 */
export const searchUsersService = async ({ userId, query, page, limit }) => {
  try {
    if (!query) {
      throw new ValidationError('Search query is required');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const contactIds = user.connections.contacts.map(contact => contact.userId);

    const filter = {
      _id: { $in: contactIds },
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ]
    };

    const { skip, take } = createPagination(page, limit);

    const users = await User.find(filter)
      .select('username email name avatar lastActive status')
      .sort({ lastActive: -1 })
      .skip(skip)
      .limit(take);

    return {
      data: users,
      total: await User.countDocuments(filter),
      page,
      limit
    };
  } catch (error) {
    logger.error('Search users error:', { userId, error: error.message });
    throw error;
  }
};

/**
 * Filter messages by type/status
 */
export const filterMessagesService = async ({ userId, type, status, page, limit }) => {
  try {
    const filter = {
      $or: [{ senderId: userId }, { receiverId: userId }]
    };

    if (type) {
      if (!['text', 'media', 'file', 'location'].includes(type)) {
        throw new ValidationError('Invalid message type');
      }
      filter.type = type;
    }

    if (status) {
      if (!['unread', 'starred', 'archived'].includes(status)) {
        throw new ValidationError('Invalid message status');
      }
      switch (status) {
        case 'unread':
          filter.status = 'delivered';
          filter.receiverId = userId;
          break;
        case 'starred':
          filter.starredBy = userId;
          break;
        case 'archived':
          filter['archiveStatus.isArchived'] = true;
          filter['archiveStatus.archivedBy'] = userId;
          break;
      }
    }

    const { skip, take } = createPagination(page, limit);

    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(take)
      .populate('senderId', 'username avatar')
      .populate('receiverId', 'username avatar');

    return {
      data: messages,
      total: await Message.countDocuments(filter),
      page,
      limit
    };
  } catch (error) {
    logger.error('Filter messages error:', { userId, error: error.message });
    throw error;
  }
};

export const trackSearchHistory = async (userId, searchData) => {
  try {
    await SearchHistory.create({
      userId,
      query: {
        text: searchData.query,
        type: searchData.type,
      },
      filters: searchData.filters,
      metrics: {
        resultCount: searchData.resultCount,
        responseTime: searchData.responseTime,
      },
    });
  } catch (error) {
    logger.error("Error tracking search history:", error);
  }
};