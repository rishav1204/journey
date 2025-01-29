// src/controllers/callController.js
import {
  initiateVoiceCallService,
  initiateVideoCallService,
  joinCallService,
  endCallService,
  toggleScreenShareService,
  toggleMuteService,
  getCallHistoryService,
  getCallDetailsService,
  startRecordingService,
  stopRecordingService,
  getRecordingService,
  adjustCallQualityService,
  getCallStatsService,
  muteParticipantService,
  toggleParticipantVideoService,
  scheduleCallService,
  getScheduledCallsService,
  updateScheduledCallService,
  cancelScheduledCallService,
  toggleBackgroundBlurService,
  setVirtualBackgroundService,
} from "../services/callService.js";
import logger from "../utils/logger.js";

export const startVoiceCall = async (req, res) => {
  try {
    const { recipientId, isGroupCall = false } = req.body;
    const initiatorId = req.user.id;

    const call = await initiateVoiceCallService({
      initiatorId,
      recipientId,
      isGroupCall,
    });

    res.status(200).json({
      success: true,
      data: call,
    });
  } catch (error) {
    logger.error("Error starting voice call:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deviceInfo = req.deviceInfo; // From middleware

export const joinVideoCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;
    const { deviceInfo } = req.body;

    const call = await joinCallService({
      callId,
      userId,
      deviceInfo,
      type: "video",
    });

    res.status(200).json({
      success: true,
      data: call,
    });
  } catch (error) {
    logger.error("Error joining video call:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const joinVoiceCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;
    const { deviceInfo } = req.body;

    const call = await joinCallService({
      callId,
      userId,
      deviceInfo,
      type: "voice",
    });

    res.status(200).json({
      success: true,
      data: call,
    });
  } catch (error) {
    logger.error("Error joining voice call:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const endCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;

    await endCallService(callId, userId);

    res.status(200).json({
      success: true,
      message: "Call ended successfully",
    });
  } catch (error) {
    logger.error("Error ending call:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleScreenShare = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;

    const call = await toggleScreenShareService(callId, userId);

    res.status(200).json({
      success: true,
      data: call,
    });
  } catch (error) {
    logger.error("Error toggling screen share:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleMute = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;

    const call = await toggleMuteService(callId, userId);

    res.status(200).json({
      success: true,
      data: call,
    });
  } catch (error) {
    logger.error("Error toggling mute:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCallHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const history = await getCallHistoryService(userId, page, limit);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    logger.error("Error fetching call history:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCallDetails = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;

    const call = await getCallDetailsService(callId, userId);

    res.status(200).json({
      success: true,
      data: call,
    });
  } catch (error) {
    logger.error("Error fetching call details:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Recording Controllers
export const startRecording = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;

    const recording = await startRecordingService(callId, userId);

    res.status(200).json({
      success: true,
      data: recording
    });
  } catch (error) {
    logger.error('Error starting recording:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const stopRecording = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;

    const recording = await stopRecordingService(callId, userId);

    res.status(200).json({
      success: true,
      data: recording
    });
  } catch (error) {
    logger.error('Error stopping recording:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getRecording = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;

    const recording = await getRecordingService(callId, userId);

    res.status(200).json({
      success: true,
      data: recording
    });
  } catch (error) {
    logger.error('Error getting recording:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Call Quality Controllers
export const adjustCallQuality = async (req, res) => {
  try {
    const { callId } = req.params;
    const { quality, bitrate } = req.body;
    const userId = req.user.id;

    const call = await adjustCallQualityService(callId, userId, { quality, bitrate });

    res.status(200).json({
      success: true,
      data: call
    });
  } catch (error) {
    logger.error('Error adjusting call quality:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getCallStats = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;

    const stats = await getCallStatsService(callId, userId);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting call stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Participant Control Controllers
export const muteParticipant = async (req, res) => {
  try {
    const { callId, userId: participantId } = req.params;
    const moderatorId = req.user.id;

    const call = await muteParticipantService(callId, participantId, moderatorId);

    res.status(200).json({
      success: true,
      data: call
    });
  } catch (error) {
    logger.error('Error muting participant:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const toggleParticipantVideo = async (req, res) => {
  try {
    const { callId, userId: participantId } = req.params;
    const moderatorId = req.user.id;

    const call = await toggleParticipantVideoService(callId, participantId, moderatorId);

    res.status(200).json({
      success: true,
      data: call
    });
  } catch (error) {
    logger.error('Error toggling participant video:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Call Scheduling Controllers
export const scheduleCall = async (req, res) => {
  try {
    const { participants, scheduledTime, duration, type } = req.body;
    const userId = req.user.id;

    const scheduledCall = await scheduleCallService({
      initiatorId: userId,
      participants,
      scheduledTime,
      duration,
      type
    });

    res.status(200).json({
      success: true,
      data: scheduledCall
    });
  } catch (error) {
    logger.error('Error scheduling call:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getScheduledCalls = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const calls = await getScheduledCallsService(userId, page, limit);

    res.status(200).json({
      success: true,
      data: calls
    });
  } catch (error) {
    logger.error('Error getting scheduled calls:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateScheduledCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const { scheduledTime, participants, duration } = req.body;
    const userId = req.user.id;

    const updatedCall = await updateScheduledCallService(callId, userId, {
      scheduledTime,
      participants,
      duration
    });

    res.status(200).json({
      success: true,
      data: updatedCall
    });
  } catch (error) {
    logger.error('Error updating scheduled call:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const cancelScheduledCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;

    await cancelScheduledCallService(callId, userId);

    res.status(200).json({
      success: true,
      message: 'Call cancelled successfully'
    });
  } catch (error) {
    logger.error('Error cancelling scheduled call:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Background Effects Controllers
export const toggleBackgroundBlur = async (req, res) => {
  try {
    const { callId } = req.params;
    const { strength } = req.body;
    const userId = req.user.id;

    const call = await toggleBackgroundBlurService(callId, userId, strength);

    res.status(200).json({
      success: true,
      data: call
    });
  } catch (error) {
    logger.error('Error toggling background blur:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const setVirtualBackground = async (req, res) => {
  try {
    const { callId } = req.params;
    const { backgroundUrl } = req.body;
    const userId = req.user.id;

    const call = await setVirtualBackgroundService(callId, userId, backgroundUrl);

    res.status(200).json({
      success: true,
      data: call
    });
  } catch (error) {
    logger.error('Error setting virtual background:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
