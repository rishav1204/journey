// src/constants/callConstants.js
export const CallType = {
  VOICE: "voice",
  VIDEO: "video",
  CONFERENCE: "conference",
};

export const CallStatus = {
  SCHEDULED: "scheduled",
  CONNECTING: "connecting",
  ONGOING: "ongoing",
  ENDED: "ended",
  MISSED: "missed",
  FAILED: "failed",
};

export const CallEvents = {
  INCOMING_CALL: "incoming_call",
  CALL_ACCEPTED: "call_accepted",
  CALL_REJECTED: "call_rejected",
  CALL_ENDED: "call_ended",
  PARTICIPANT_JOINED: "participant_joined",
  PARTICIPANT_LEFT: "participant_left",
  PARTICIPANT_MUTED: "participant_muted",
  PARTICIPANT_UNMUTED: "participant_unmuted",
  SCREEN_SHARE_TOGGLE: "screen_share_toggle",
  RECORDING_STARTED: "recording_started",
  RECORDING_STOPPED: "recording_stopped",
  CALL_ERROR: "call_error",
  CONNECTION_QUALITY: "connection_quality",
};

export const CallQuality = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  AUTO: "auto",
};

export const ParticipantRole = {
  HOST: "host",
  COHOST: "cohost",
  PARTICIPANT: "participant",
};

export const ParticipantStatus = {
  INVITED: "invited",
  RINGING: "ringing",
  ACCEPTED: "accepted",
  DECLINED: "declined",
  MISSED: "missed",
  REMOVED: "removed",
};
