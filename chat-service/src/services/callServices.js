// src/services/callService.js
import Call from "../database/models/Call.js";
import User from "../database/models/User.js";
import { CallEvents, CallStatus, CallType } from "../constants/callConstants.js";
import logger from "../utils/logger.js";
import { NotFoundError, ValidationError, PermissionError } from "../utils/errors.js";
import { generateCallId, validateCallDuration } from "../utils/callUtils.js";
import { emitCallEvent } from "../utils/socketEvents.js";
import { uploadToCloud, deleteFromCloud } from "../utils/cloudStorage.js";

/**
 * Service to initiate a voice call
 */
export const initiateVoiceCallService = async ({ initiatorId, recipientId, isGroupCall = false }) => {
  try {
    // Start MongoDB session for transaction
    const session = await Call.startSession();
    session.startTransaction();

    try {
      // Validate participants
      const participants = await validateParticipants(initiatorId, recipientId, isGroupCall);

      // Create call record
      const call = await Call.create([{
        type: CallType.VOICE,
        initiator: initiatorId,
        participants: participants.map(p => ({
          userId: p,
          status: p === initiatorId ? 'joined' : 'pending',
          joinedAt: p === initiatorId ? new Date() : null
        })),
        status: CallStatus.ONGOING,
        timing: {
          startTime: new Date(),
          scheduledDuration: 3600 // 1 hour default
        },
        isGroupCall,
        mediaConfig: {
          audioEnabled: true,
          quality: "high"
        }
      }], { session });

      // Notify participants
      await notifyCallParticipants(call[0]);

      await session.commitTransaction();
      return call[0];

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    logger.error('Error in initiateVoiceCallService:', error);
    throw error;
  }
};

/**
 * Service to initiate a video call
 */
export const initiateVideoCallService = async ({ initiatorId, recipientId, isGroupCall = false }) => {
  try {
    const session = await Call.startSession();
    session.startTransaction();

    try {
      const participants = await validateParticipants(initiatorId, recipientId, isGroupCall);

      const call = await Call.create([{
        type: CallType.VIDEO,
        initiator: initiatorId,
        participants: participants.map(p => ({
          userId: p,
          status: p === initiatorId ? 'joined' : 'pending',
          joinedAt: p === initiatorId ? new Date() : null
        })),
        status: CallStatus.ONGOING,
        timing: {
          startTime: new Date(),
          scheduledDuration: 3600
        },
        isGroupCall,
        mediaConfig: {
          audioEnabled: true,
          videoEnabled: true,
          quality: "high"
        },
        features: {
          backgroundBlur: false,
          noiseReduction: true
        }
      }], { session });

      await notifyCallParticipants(call[0]);

      await session.commitTransaction();
      return call[0];

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    logger.error('Error in initiateVideoCallService:', error);
    throw error;
  }
};

/**
 * Service to join an ongoing call
 */
export const joinCallService = async ({ callId, userId, deviceInfo, type }) => {
  try {
    const call = await Call.findById(callId);
    if (!call) {
      throw new NotFoundError('Call not found');
    }

    if (call.status !== CallStatus.ONGOING) {
      throw new ValidationError('Call is not active');
    }

    const participant = call.participants.find(p => p.userId.toString() === userId);
    if (!participant) {
      throw new PermissionError('User is not a participant of this call');
    }

    // Update participant status
    participant.status = 'joined';
    participant.joinedAt = new Date();
    participant.deviceInfo = deviceInfo;

    await call.save();

    // Notify other participants
    emitCallEvent(CallEvents.PARTICIPANT_JOINED, {
      callId,
      userId,
      timestamp: new Date()
    });

    return call;

  } catch (error) {
    logger.error('Error in joinCallService:', error);
    throw error;
  }
};

/**
 * Service to end an ongoing call
 */
export const endCallService = async (callId, userId) => {
  try {
    const call = await Call.findById(callId);
    if (!call) {
      throw new NotFoundError('Call not found');
    }

    // Only initiator or admin can end call for everyone
    if (call.initiator.toString() !== userId) {
      throw new PermissionError('Not authorized to end call');
    }

    call.status = CallStatus.ENDED;
    call.timing.endTime = new Date();
    call.timing.duration = (call.timing.endTime - call.timing.startTime) / 1000; // duration in seconds

    await call.save();

    // Notify all participants
    emitCallEvent(CallEvents.CALL_ENDED, {
      callId,
      endedBy: userId,
      timestamp: new Date()
    });

    return call;

  } catch (error) {
    logger.error('Error in endCallService:', error);
    throw error;
  }
};

/**
 * Service to toggle screen sharing
 */
export const toggleScreenShareService = async (callId, userId) => {
  try {
    const call = await Call.findById(callId);
    if (!call) {
      throw new NotFoundError('Call not found');
    }

    const participant = call.participants.find(p => p.userId.toString() === userId);
    if (!participant) {
      throw new PermissionError('User is not a participant of this call');
    }

    // Toggle screen sharing
    call.screenSharing = {
      isActive: !call.screenSharing?.isActive,
      sharedBy: call.screenSharing?.isActive ? null : userId
    };

    await call.save();

    // Notify participants
    emitCallEvent(CallEvents.SCREEN_SHARE_TOGGLE, {
      callId,
      userId,
      isSharing: call.screenSharing.isActive
    });

    return call;

  } catch (error) {
    logger.error('Error in toggleScreenShareService:', error);
    throw error;
  }
};

// Helper functions
const validateParticipants = async (initiatorId, recipientId, isGroupCall) => {
  const participants = isGroupCall ? recipientId : [recipientId];
  
  // Validate all participants exist
  const users = await User.find({ 
    _id: { $in: [...participants, initiatorId] }
  });

  if (users.length !== participants.length + 1) {
    throw new ValidationError('One or more participants not found');
  }

  // Check block status
  const blockedUsers = await checkBlockedStatus(initiatorId, participants);
  if (blockedUsers.length > 0) {
    throw new PermissionError('Cannot initiate call with blocked users');
  }

  return [initiatorId, ...participants];
};

const notifyCallParticipants = async (call) => {
  // Notify through WebSocket
  const participantIds = call.participants
    .filter(p => p.userId.toString() !== call.initiator.toString())
    .map(p => p.userId);

  emitCallEvent(CallEvents.INCOMING_CALL, {
    callId: call._id,
    initiator: call.initiator,
    type: call.type,
    participants: participantIds
  });
};

// Recording Services
export const startRecordingService = async (callId, userId) => {
  try {
    const call = await Call.findById(callId);
    if (!call) {
      throw new NotFoundError("Call not found");
    }

    // Verify permissions
    const participant = call.participants.find(p => p.userId.toString() === userId);
    if (!participant || !["host", "cohost"].includes(participant.role)) {
      throw new PermissionError("Only hosts can manage recordings");
    }

    // Start recording
    call.recording = {
      enabled: true,
      startedBy: userId,
      startTime: new Date(),
      status: "recording",
      format: "mp4"
    };

    await call.save();

    // Notify participants
    emitCallEvent(CallEvents.RECORDING_STARTED, {
      callId,
      startedBy: userId
    });

    return call.recording;
  } catch (error) {
    logger.error("Recording start error:", error);
    throw error;
  }
};

export const stopRecordingService = async (callId, userId) => {
  try {
    const call = await Call.findById(callId);
    if (!call) throw new NotFoundError("Call not found");

    if (!call.recording?.enabled) {
      throw new ValidationError("No active recording found");
    }

    // Upload recording to cloud storage
    const recordingUrl = await uploadToCloud(call.recording.tempPath);

    call.recording = {
      ...call.recording,
      enabled: false,
      endTime: new Date(),
      status: "completed",
      url: recordingUrl,
      duration: (new Date() - call.recording.startTime) / 1000
    };

    await call.save();

    emitCallEvent(CallEvents.RECORDING_STOPPED, {
      callId,
      stoppedBy: userId
    });

    return call.recording;
  } catch (error) {
    logger.error("Recording stop error:", error);
    throw error;
  }
};

export const getRecordingService = async (callId, userId) => {
  try {
    const call = await Call.findById(callId);
    if (!call) throw new NotFoundError("Call not found");

    const participant = call.participants.find(p => p.userId.toString() === userId);
    if (!participant) {
      throw new PermissionError("Not authorized to access recording");
    }

    return call.recording;
  } catch (error) {
    logger.error("Get recording error:", error);
    throw error;
  }
};

// Call Quality Services
export const adjustCallQualityService = async (callId, userId, { quality, bitrate }) => {
  try {
    const call = await Call.findById(callId);
    if (!call) throw new NotFoundError("Call not found");

    const participant = call.participants.find(p => p.userId.toString() === userId);
    if (!participant) {
      throw new PermissionError("Not a participant in this call");
    }

    call.mediaConfig = {
      ...call.mediaConfig,
      quality,
      bitrate,
      lastUpdated: new Date()
    };

    await call.save();

    emitCallEvent(CallEvents.CONNECTION_QUALITY, {
      callId,
      quality,
      bitrate
    });

    return call;
  } catch (error) {
    logger.error("Quality adjustment error:", error);
    throw error;
  }
};

export const getCallStatsService = async (callId, userId) => {
  try {
    const call = await Call.findById(callId);
    if (!call) throw new NotFoundError("Call not found");

    const participant = call.participants.find(p => p.userId.toString() === userId);
    if (!participant) {
      throw new PermissionError("Not authorized to view call stats");
    }

    return {
      duration: call.timing.duration,
      participants: call.participants.length,
      quality: call.mediaConfig.quality,
      networkStats: call.networkStats,
      participantStats: call.participants.map(p => ({
        userId: p.userId,
        joinDuration: p.leftAt ? p.leftAt - p.joinedAt : new Date() - p.joinedAt,
        connectionQuality: p.connectionQuality
      }))
    };
  } catch (error) {
    logger.error("Get stats error:", error);
    throw error;
  }
};

// Participant Control Services
export const muteParticipantService = async (callId, participantId, moderatorId) => {
  try {
    const call = await Call.findById(callId);
    if (!call) throw new NotFoundError("Call not found");

    // Check moderator permissions
    const moderator = call.participants.find(p => p.userId.toString() === moderatorId);
    if (!moderator || !["host", "cohost"].includes(moderator.role)) {
      throw new PermissionError("Not authorized to mute participants");
    }

    // Update participant's audio status
    const participant = call.participants.find(p => p.userId.toString() === participantId);
    if (!participant) throw new NotFoundError("Participant not found");

    participant.permissions.canSpeak = false;
    await call.save();

    emitCallEvent(CallEvents.PARTICIPANT_MUTED, {
      callId,
      participantId,
      mutedBy: moderatorId
    });

    return call;
  } catch (error) {
    logger.error("Mute participant error:", error);
    throw error;
  }
};

export const toggleParticipantVideoService = async (callId, participantId, moderatorId) => {
  try {
    const call = await Call.findById(callId);
    if (!call) throw new NotFoundError("Call not found");

    const moderator = call.participants.find(p => p.userId.toString() === moderatorId);
    if (!moderator || !["host", "cohost"].includes(moderator.role)) {
      throw new PermissionError("Not authorized to control video");
    }

    const participant = call.participants.find(p => p.userId.toString() === participantId);
    if (!participant) throw new NotFoundError("Participant not found");

    participant.permissions.canVideo = !participant.permissions.canVideo;
    await call.save();

    emitCallEvent(CallEvents.VIDEO_TOGGLE, {
      callId,
      participantId,
      enabled: participant.permissions.canVideo
    });

    return call;
  } catch (error) {
    logger.error("Toggle video error:", error);
    throw error;
  }
};

// Call Scheduling Services
export const scheduleCallService = async ({ initiatorId, participants, scheduledTime, duration, type }) => {
  try {
    const call = new Call({
      type,
      initiator: initiatorId,
      participants: [
        {
          userId: initiatorId,
          role: "host",
          status: "accepted"
        },
        ...participants.map(p => ({
          userId: p,
          role: "participant",
          status: "pending"
        }))
      ],
      timing: {
        scheduledFor: new Date(scheduledTime),
        scheduledDuration: duration
      },
      status: CallStatus.SCHEDULED
    });

    await call.save();

    // Send notifications to participants
    emitCallEvent(CallEvents.CALL_SCHEDULED, {
      callId: call._id,
      scheduledFor: scheduledTime,
      initiator: initiatorId,
      participants
    });

    return call;
  } catch (error) {
    logger.error("Schedule call error:", error);
    throw error;
  }
};

export const getScheduledCallsService = async (userId, page = 1, limit = 10) => {
  try {
    const calls = await Call.find({
      "participants.userId": userId,
      status: CallStatus.SCHEDULED,
      "timing.scheduledFor": { $gt: new Date() }
    })
    .sort({ "timing.scheduledFor": 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("participants.userId", "username profilePicture");

    return calls;
  } catch (error) {
    logger.error("Get scheduled calls error:", error);
    throw error;
  }
};

export const updateScheduledCallService = async (callId, userId, updates) => {
  try {
    const call = await Call.findById(callId);
    if (!call) throw new NotFoundError("Call not found");

    if (call.initiator.toString() !== userId) {
      throw new PermissionError("Only call initiator can update schedule");
    }

    if (call.status !== CallStatus.SCHEDULED) {
      throw new ValidationError("Can only update scheduled calls");
    }

    Object.assign(call, updates);
    await call.save();

    emitCallEvent(CallEvents.SCHEDULE_UPDATED, {
      callId,
      updates
    });

    return call;
  } catch (error) {
    logger.error("Update schedule error:", error);
    throw error;
  }
};

export const cancelScheduledCallService = async (callId, userId) => {
  try {
    const call = await Call.findById(callId);
    if (!call) throw new NotFoundError("Call not found");

    if (call.initiator.toString() !== userId) {
      throw new PermissionError("Only call initiator can cancel");
    }

    call.status = CallStatus.CANCELLED;
    await call.save();

    emitCallEvent(CallEvents.CALL_CANCELLED, {
      callId,
      cancelledBy: userId
    });

    return call;
  } catch (error) {
    logger.error("Cancel call error:", error);
    throw error;
  }
};

// Background Effects Services
export const toggleBackgroundBlurService = async (callId, userId, strength) => {
  try {
    const call = await Call.findById(callId);
    if (!call) throw new NotFoundError("Call not found");

    const participant = call.participants.find(p => p.userId.toString() === userId);
    if (!participant) throw new ValidationError("Not in call");

    participant.features = {
      ...participant.features,
      backgroundBlur: {
        enabled: true,
        strength: strength || 0.5
      }
    };

    await call.save();

    return call;
  } catch (error) {
    logger.error("Background blur error:", error);
    throw error;
  }
};

export const setVirtualBackgroundService = async (callId, userId, backgroundUrl) => {
  try {
    const call = await Call.findById(callId);
    if (!call) throw new NotFoundError("Call not found");

    const participant = call.participants.find(p => p.userId.toString() === userId);
    if (!participant) throw new ValidationError("Not in call");

    participant.features = {
      ...participant.features,
      virtualBackground: {
        enabled: true,
        url: backgroundUrl
      }
    };

    await call.save();

    return call;
  } catch (error) {
    logger.error("Virtual background error:", error);
    throw error;
  }
};