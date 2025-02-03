import {
  initiateGroupCall,
  addCallParticipant,
  removeCallParticipant,
} from "../services/groupCallService.js";
import logger from "../utils/logger.js";

export const startGroupCall = async (req, res) => {
  try {
    const { participants, callType, scheduledTime } = req.body;
    const initiatorId = req.user.id;

    const call = await initiateGroupCall({
      initiatorId,
      participants,
      callType,
      scheduledTime,
    });

    res.status(200).json({
      success: true,
      data: call,
    });
  } catch (error) {
    logger.error("Error starting group call:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addParticipant = async (req, res) => {
  try {
    const { callId } = req.params;
    const { userId } = req.body;
    const initiatorId = req.user.id;

    const updatedCall = await addCallParticipant({
      callId,
      userId,
      initiatorId,
    });

    res.status(200).json({
      success: true,
      data: updatedCall,
    });
  } catch (error) {
    logger.error("Error adding participant:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeParticipant = async (req, res) => {
  try {
    const { callId, userId } = req.params;
    const initiatorId = req.user.id;

    await removeCallParticipant({
      callId,
      userId,
      initiatorId,
    });

    res.status(200).json({
      success: true,
      message: "Participant removed successfully",
    });
  } catch (error) {
    logger.error("Error removing participant:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
