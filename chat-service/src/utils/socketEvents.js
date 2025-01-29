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
