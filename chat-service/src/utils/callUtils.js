// src/utils/callUtils.js
import crypto from "crypto";

export const generateCallId = () => {
  return crypto.randomBytes(16).toString("hex");
};

export const validateCallDuration = (duration) => {
  const maxDuration = 24 * 60 * 60; // 24 hours in seconds
  if (duration <= 0 || duration > maxDuration) {
    throw new ValidationError("Invalid call duration");
  }
  return true;
};

export const formatCallDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return {
    hours,
    minutes,
    seconds: remainingSeconds,
    formatted: `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`,
  };
};

export const isCallActive = (call) => {
  return call.status === CallStatus.ONGOING;
};

export const canJoinCall = (call, userId) => {
  const participant = call.participants.find(
    (p) => p.userId.toString() === userId
  );
  return participant && call.status === CallStatus.ONGOING;
};

export const checkBrowserCompatibility = () => {
  const browser = navigator.userAgent;
  const compatibilityCheck = validateDeviceCompatibility(browser);
  
  if (!compatibilityCheck.isCompatible) {
    throw new Error(`Your browser is not supported. Please use one of: ${SUPPORTED_BROWSERS.join(', ')} (minimum versions: ${JSON.stringify(MINIMUM_VERSIONS)})`);
  }
  
  return compatibilityCheck.deviceInfo;
};