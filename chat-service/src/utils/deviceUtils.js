// src/utils/deviceUtils.js
import UserAgent from "useragent";
import logger from "./logger.js";

const SUPPORTED_BROWSERS = ["Chrome", "Firefox", "Safari", "Edge", "Opera"];

const MINIMUM_VERSIONS = {
  Chrome: 60,
  Firefox: 52,
  Safari: 11,
  Edge: 79,
  Opera: 47,
};

export const validateDeviceCompatibility = async (userAgentString) => {
  try {
    const agent = UserAgent.parse(userAgentString);
    const browser = agent.family;
    const version = parseInt(agent.major);

    // Check if browser is supported
    if (!SUPPORTED_BROWSERS.includes(browser)) {
      logger.warn(`Unsupported browser: ${browser}`);
      return {
        isCompatible: false,
        reason: "Browser not supported",
        requirements: {
          supportedBrowsers: SUPPORTED_BROWSERS,
        },
      };
    }

    // Check browser version
    if (version < MINIMUM_VERSIONS[browser]) {
      logger.warn(`Browser version too old: ${browser} ${version}`);
      return {
        isCompatible: false,
        reason: "Browser version not supported",
        requirements: {
          minimumVersion: MINIMUM_VERSIONS[browser],
          currentVersion: version,
        },
      };
    }

    // Check WebRTC support
    const hasWebRTC = typeof RTCPeerConnection !== "undefined";
    if (!hasWebRTC) {
      logger.warn("WebRTC not supported");
      return {
        isCompatible: false,
        reason: "WebRTC not supported",
      };
    }

    return {
      isCompatible: true,
      deviceInfo: {
        browser,
        version,
        platform: agent.os.family,
        device: agent.device.family,
      },
    };
  } catch (error) {
    logger.error("Error validating device compatibility:", error);
    throw error;
  }
};

export const validateRecordingPermission = async (req, res, next) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;

    // Check if call exists and is active
    const call = await Call.findById(callId);
    if (!call || call.status !== CallStatus.ONGOING) {
      throw new ValidationError("Call must be active to start recording");
    }

    // Check user's role in call
    const participant = call.participants.find(
      (p) => p.userId.toString() === userId
    );
    if (!participant || !["host", "cohost"].includes(participant.role)) {
      throw new PermissionError("Only hosts can manage recordings");
    }

    // Check storage limits
    const userStorage = await getUserStorageInfo(userId);
    if (userStorage.remainingSpace < MINIMUM_RECORDING_SPACE) {
      throw new ValidationError("Insufficient storage space for recording");
    }

    // Check recording limits
    const activeRecordings = await Call.countDocuments({
      "recording.status": "active",
      "participants.userId": userId,
    });

    if (activeRecordings >= MAX_CONCURRENT_RECORDINGS) {
      throw new ValidationError("Maximum concurrent recordings limit reached");
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateScheduling = async (req, res, next) => {
  try {
    const { scheduledTime, duration, participants, type } = req.body;
    const userId = req.user.id;

    // Validate scheduled time
    const scheduledDate = new Date(scheduledTime);
    if (scheduledDate < new Date()) {
      throw new ValidationError("Cannot schedule calls in the past");
    }

    // Maximum schedule ahead time (30 days)
    const maxScheduleDate = new Date();
    maxScheduleDate.setDate(maxScheduleDate.getDate() + 30);
    if (scheduledDate > maxScheduleDate) {
      throw new ValidationError(
        "Cannot schedule calls more than 30 days ahead"
      );
    }

    // Validate duration
    if (duration < MIN_CALL_DURATION || duration > MAX_CALL_DURATION) {
      throw new ValidationError(
        `Call duration must be between ${MIN_CALL_DURATION} and ${MAX_CALL_DURATION} minutes`
      );
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
      throw new ValidationError("Schedule conflicts with existing call");
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
      throw new ValidationError("Some participants are not available", {
        unavailableParticipants,
      });
    }

    // Add validated data to request
    req.scheduledCall = {
      scheduledTime: scheduledDate,
      duration,
      type,
      participants,
    };

    next();
  } catch (error) {
    next(error);
  }
};
