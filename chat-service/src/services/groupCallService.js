// services/groupCallService.js
import Call from "../database/models/Call.js";
import {
  CallEvents,
  CallStatus,
  CallType,
} from "../constants/callConstants.js";
import logger from "../utils/logger.js";
import {
  NotFoundError,
  ValidationError,
  PermissionError,
} from "../utils/errors.js";
import { emitCallEvent } from "../utils/socketEvents.js";
import { checkUserAvailability } from "./userService.js";

export const initiateGroupCall = async ({
  initiatorId,
  participants,
  callType,
  scheduledTime,
}) => {
  const session = await Call.startSession();
  try {
    session.startTransaction();

    // Validate all participants
    for (const participantId of participants) {
      const availability = await checkUserAvailability(participantId);
      if (!availability.isAvailable) {
        throw new ValidationError(
          `User ${participantId} is not available: ${availability.reason}`
        );
      }
    }

    const call = await Call.create(
      [
        {
          type: callType,
          initiator: initiatorId,
          participants: [
            {
              userId: initiatorId,
              role: "host",
              status: "joined",
              joinedAt: new Date(),
            },
            ...participants.map((p) => ({
              userId: p,
              role: "participant",
              status: "invited",
            })),
          ],
          timing: {
            scheduledFor: scheduledTime,
            startTime: scheduledTime || new Date(),
          },
          isGroupCall: true,
          status: scheduledTime ? CallStatus.SCHEDULED : CallStatus.ONGOING,
          groupCall: {
            maxParticipants: 8,
            waitingRoom: true,
          },
        },
      ],
      { session }
    );

    await session.commitTransaction();

    // Notify participants
    emitCallEvent(CallEvents.INCOMING_CALL, {
      callId: call[0]._id,
      initiator: initiatorId,
      type: callType,
      participants,
    });

    return call[0];
  } catch (error) {
    await session.abortTransaction();
    logger.error("Group call initiation failed:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

export const addCallParticipant = async ({ callId, userId, initiatorId }) => {
  const call = await Call.findById(callId);
  if (!call) {
    throw new NotFoundError("Call not found");
  }

  // Check permissions
  if (
    !call.participants.find(
      (p) =>
        p.userId.toString() === initiatorId &&
        ["host", "cohost"].includes(p.role)
    )
  ) {
    throw new PermissionError("Only hosts can add participants");
  }

  // Check if user is already in call
  if (call.participants.find((p) => p.userId.toString() === userId)) {
    throw new ValidationError("User is already in the call");
  }

  // Check user availability
  const availability = await checkUserAvailability(userId);
  if (!availability.isAvailable) {
    throw new ValidationError(`User is not available: ${availability.reason}`);
  }

  // Add participant
  call.participants.push({
    userId,
    role: "participant",
    status: "invited",
    joinedAt: new Date(),
  });

  await call.save();

  // Notify new participant
  emitCallEvent(CallEvents.INCOMING_CALL, {
    callId: call._id,
    initiator: initiatorId,
    type: call.type,
    participants: [userId],
  });

  return call;
};

export const removeCallParticipant = async ({
  callId,
  userId,
  initiatorId,
}) => {
  const call = await Call.findById(callId);
  if (!call) {
    throw new NotFoundError("Call not found");
  }

  // Check permissions
  const initiator = call.participants.find(
    (p) => p.userId.toString() === initiatorId
  );
  if (!initiator || !["host", "cohost"].includes(initiator.role)) {
    throw new PermissionError("Only hosts can remove participants");
  }

  // Remove participant
  const participantIndex = call.participants.findIndex(
    (p) => p.userId.toString() === userId
  );
  if (participantIndex === -1) {
    throw new NotFoundError("Participant not found in call");
  }

  call.participants[participantIndex].status = "removed";
  call.participants[participantIndex].leftAt = new Date();

  await call.save();

  // Notify participant of removal
  emitCallEvent(CallEvents.PARTICIPANT_REMOVED, {
    callId: call._id,
    userId,
    removedBy: initiatorId,
  });

  return call;
};
