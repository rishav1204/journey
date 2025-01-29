import { validateDeviceCompatibility } from "../utils/deviceUtils.js";
import { checkUserAvailability } from "../services/userService.js";
import { PermissionError, ValidationError } from "../utils/errors.js";
import {
  CallValidationError,
  RecordingError,
  SchedulingError,
} from "../utils/errors.js";


export const validateRecordingPermission = async (req, res, next) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;

    // Check if call exists and is active
    const call = await Call.findById(callId);
    if (!call) {
      throw new CallValidationError("Call not found", { callId });
    }

    if (call.status !== CallStatus.ONGOING) {
      throw new RecordingError(
        "Recording can only be started for ongoing calls",
        {
          currentStatus: call.status,
          callId,
        }
      );
    }

    // Check user's role in call
    const participant = call.participants.find(
      (p) => p.userId.toString() === userId
    );
    if (!participant) {
      throw new RecordingError("User is not a participant in this call", {
        userId,
        callId,
      });
    }

    if (!["host", "cohost"].includes(participant.role)) {
      throw new RecordingError(
        "Insufficient permissions to manage recordings",
        {
          userRole: participant.role,
          requiredRoles: ["host", "cohost"],
        }
      );
    }

    // Check storage limits
    const userStorage = await getUserStorageInfo(userId);
    if (userStorage.remainingSpace < MINIMUM_RECORDING_SPACE) {
      throw new RecordingError("Insufficient storage space", {
        available: userStorage.remainingSpace,
        required: MINIMUM_RECORDING_SPACE,
      });
    }

    // Check recording limits
    const activeRecordings = await Call.countDocuments({
      "recording.status": "active",
      "participants.userId": userId,
    });

    if (activeRecordings >= MAX_CONCURRENT_RECORDINGS) {
      throw new RecordingError("Recording limit exceeded", {
        current: activeRecordings,
        maximum: MAX_CONCURRENT_RECORDINGS,
      });
    }

    logger.info("Recording permission validated", { userId, callId });
    next();
  } catch (error) {
    logger.error("Recording validation failed:", {
      error: error.message,
      stack: error.stack,
      details: error.details,
    });
    next(error);
  }
};

export const validateScheduling = async (req, res, next) => {
  try {
    const { scheduledTime, duration, participants, type } = req.body;
    const userId = req.user.id;

    // Validate scheduled time
    const scheduledDate = new Date(scheduledTime);
    const now = new Date();

    if (scheduledDate < now) {
      throw new SchedulingError("Invalid scheduling time", {
        provided: scheduledDate,
        minimum: now,
      });
    }

    // Maximum schedule ahead time (30 days)
    const maxScheduleDate = new Date();
    maxScheduleDate.setDate(maxScheduleDate.getDate() + 30);
    if (scheduledDate > maxScheduleDate) {
      throw new SchedulingError("Schedule too far in future", {
        provided: scheduledDate,
        maximum: maxScheduleDate,
      });
    }

    // Validate duration
    if (duration < MIN_CALL_DURATION || duration > MAX_CALL_DURATION) {
      throw new SchedulingError("Invalid call duration", {
        provided: duration,
        allowed: { min: MIN_CALL_DURATION, max: MAX_CALL_DURATION },
      });
    }

    // Check for scheduling conflicts
    const conflictingCalls = await Call.findOne({
      "timing.scheduledFor": {
        $lt: new Date(scheduledDate.getTime() + duration * 60000),
        $gt: scheduledDate,
      },
      "participants.userId": { $in: [userId, ...participants] },
      status: { $in: ["scheduled", "ongoing"] },
    });

    if (conflictingCalls) {
      throw new SchedulingError("Schedule conflict detected", {
        conflictingCallId: conflictingCalls._id,
        conflictingTime: conflictingCalls.timing.scheduledFor,
      });
    }

    // Verify participant availability
    const unavailableParticipants = [];
    for (const participantId of participants) {
      const availability = await checkUserAvailability(
        participantId,
        scheduledDate
      );
      if (!availability.isAvailable) {
        unavailableParticipants.push({
          userId: participantId,
          reason: availability.reason,
        });
      }
    }

    if (unavailableParticipants.length > 0) {
      throw new SchedulingError("Participants unavailable", {
        unavailableParticipants,
      });
    }

    req.scheduledCall = {
      scheduledTime: scheduledDate,
      duration,
      type,
      participants,
    };

    logger.info("Call scheduling validated", {
      userId,
      scheduledTime: scheduledDate,
      participants: participants.length,
    });
    next();
  } catch (error) {
    logger.error("Scheduling validation failed:", {
      error: error.message,
      stack: error.stack,
      details: error.details,
    });
    next(error);
  }
};

export const validateCallRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check user availability
    const isAvailable = await checkUserAvailability(userId);
    if (!isAvailable) {
      throw new ValidationError("User is currently in another call");
    }

    // Validate device compatibility
    const deviceInfo = req.headers["user-agent"];
    const isCompatible = await validateDeviceCompatibility(deviceInfo);
    if (!isCompatible) {
      throw new ValidationError("Device not compatible for call");
    }

    // Verify call permissions
    const userPermissions = await getUserCallPermissions(userId);
    if (!userPermissions.canInitiateCall) {
      throw new PermissionError("User not authorized to initiate calls");
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const secureCallConnection = async (req, res, next) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;

    // Verify encryption capabilities
    const encryptionKey = await generateCallEncryptionKey(callId);
    req.callEncryption = encryptionKey;

    // Validate session
    const isValidSession = await validateCallSession(callId, userId);
    if (!isValidSession) {
      throw new PermissionError("Invalid call session");
    }

    // Check rate limiting
    const canMakeCall = await checkCallRateLimit(userId);
    if (!canMakeCall) {
      throw new ValidationError("Call rate limit exceeded");
    }

    next();
  } catch (error) {
    next(error);
  }
};
