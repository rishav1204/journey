// src/utils/socketEvents.js
import { io } from "../../index.js";
import logger from "./logger.js";


export const emitCallEvent = async (eventName, data) => {
  try {
    // Emit to specific users or rooms based on event type
    switch (eventName) {
      case CallEvents.INCOMING_CALL:
        data.participants.forEach((userId) => {
          io.to(`user:${userId}`).emit(eventName, data);
        });
        break;

      case CallEvents.CALL_ENDED:
      case CallEvents.PARTICIPANT_JOINED:
      case CallEvents.PARTICIPANT_LEFT:
      case CallEvents.SCREEN_SHARE_TOGGLE:
        io.to(`call:${data.callId}`).emit(eventName, data);
        break;

      default:
        logger.warn(`Unhandled call event type: ${eventName}`);
    }

    logger.info(`Emitted ${eventName} event`, { data });
  } catch (error) {
    logger.error(`Error emitting ${eventName} event:`, error);
    throw error;
  }
};

// Socket event types
export const SocketEvents = {
  MESSAGE_SENT: 'message_sent',
  MESSAGE_READ: 'message_read',
  USER_TYPING: 'user_typing',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  GROUP_UPDATED: 'group_updated',
  VOICE_STATE_CHANGED: 'voice_state_changed',
  SETTINGS_UPDATED: 'settings_updated'
};

/**
 * Emit socket event to specific room/user
 * @param {string} target - Target room/user (e.g., 'user:123', 'group:456')
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
export const emitSocketEvent = async (target, event, data) => {
  try {
    // Validate inputs
    if (!target || !event) {
      throw new Error('Target and event are required');
    }

    // Add timestamp to data
    const eventData = {
      ...data,
      timestamp: new Date(),
    };

    // Emit event to target
    io.to(target).emit(event, eventData);

    // Log event emission
    logger.debug('Socket event emitted', {
      target,
      event,
      data: eventData
    });
  } catch (error) {
    logger.error(`Error emitting socket event ${event}:`, {
      error,
      target,
      data
    });
    throw error;
  }
};

/**
 * Broadcast socket event to all connected clients except sender
 * @param {string} event - Event name
 * @param {Object} data - Event data
 * @param {string} [senderSocketId] - Socket ID to exclude
 */
export const broadcastSocketEvent = async (event, data, senderSocketId = null) => {
  try {
    const eventData = {
      ...data,
      timestamp: new Date(),
    };

    if (senderSocketId) {
      io.except(senderSocketId).emit(event, eventData);
    } else {
      io.emit(event, eventData);
    }

    logger.debug('Socket event broadcasted', {
      event,
      data: eventData,
      excludedSocket: senderSocketId
    });
  } catch (error) {
    logger.error(`Error broadcasting socket event ${event}:`, {
      error,
      data
    });
    throw error;
  }
};

/**
 * Join socket rooms
 * @param {string} socketId - Socket ID
 * @param {string[]} rooms - Array of room names to join
 */
export const joinSocketRooms = async (socketId, rooms) => {
  try {
    const socket = io.sockets.sockets.get(socketId);
    if (!socket) {
      throw new Error(`Socket ${socketId} not found`);
    }

    await Promise.all(rooms.map(room => socket.join(room)));

    logger.debug('Socket joined rooms', {
      socketId,
      rooms
    });
  } catch (error) {
    logger.error('Error joining socket rooms:', {
      error,
      socketId,
      rooms
    });
    throw error;
  }
};

/**
 * Leave socket rooms
 * @param {string} socketId - Socket ID
 * @param {string[]} rooms - Array of room names to leave
 */
export const leaveSocketRooms = async (socketId, rooms) => {
  try {
    const socket = io.sockets.sockets.get(socketId);
    if (!socket) {
      throw new Error(`Socket ${socketId} not found`);
    }

    await Promise.all(rooms.map(room => socket.leave(room)));

    logger.debug('Socket left rooms', {
      socketId,
      rooms
    });
  } catch (error) {
    logger.error('Error leaving socket rooms:', {
      error,
      socketId,
      rooms
    });
    throw error;
  }
};

export default {
  emitSocketEvent,
  broadcastSocketEvent,
  joinSocketRooms,
  leaveSocketRooms,
  SocketEvents
};