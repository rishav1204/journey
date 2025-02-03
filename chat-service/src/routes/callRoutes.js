// src/routes/callRoutes.js
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { deviceCompatibilityCheck } from "../middlewares/deviceCompatibilityMiddleware.js";
import {
  startVoiceCall,
  startVideoCall,
  joinVideoCall,
  joinVoiceCall,
  endCall,
  toggleScreenShare,
  toggleMute,
  getCallHistory,
  getCallDetails,
  startRecording,
  stopRecording,
  getRecording,
  adjustCallQuality,
  getCallStats,
  muteParticipant,
  toggleParticipantVideo,
  scheduleCall,
  getScheduledCalls,
  updateScheduledCall,
  cancelScheduledCall,
  toggleBackgroundBlur,
  setVirtualBackground,
} from "../controllers/callController.js";
import {
  startGroupCall,
  addParticipant,
  removeParticipant,
} from "../controllers/groupCallController.js";
import {
  validateCallRequest,
  secureCallConnection,
  validateRecordingPermission,
  validateScheduling,
} from "../middlewares/callMiddleware.js";

const router = Router();

// Basic Call Operations with Device Compatibility
router.post(
  "/voice/start",
  [authMiddleware, deviceCompatibilityCheck, validateCallRequest],
  startVoiceCall
);

router.post(
  "/video/start",
  [authMiddleware, deviceCompatibilityCheck, validateCallRequest],
  startVideoCall
);

router.post(
  "/video/join",
  [authMiddleware, deviceCompatibilityCheck, validateCallRequest],
  joinVideoCall
);

router.post(
  "/voice/join",
  [authMiddleware, deviceCompatibilityCheck, validateCallRequest],
  joinVoiceCall
);

// Group Call Operations
router.post(
  "/group/start",
  [
    authMiddleware,
    deviceCompatibilityCheck,
    validateCallRequest,
    secureCallConnection,
  ],
  startGroupCall
);

router.post(
  "/:callId/participants/add",
  [authMiddleware, validateCallRequest],
  addParticipant
);

router.delete(
  "/:callId/participants/:userId",
  [authMiddleware, validateCallRequest],
  removeParticipant
);

// Call Control Operations
router.post("/:callId/end", [authMiddleware, validateCallRequest], endCall);

router.post(
  "/:callId/screen-share",
  [authMiddleware, validateCallRequest],
  toggleScreenShare
);

router.post("/:callId/mute", [authMiddleware, validateCallRequest], toggleMute);

// Call Recording Features
router.post(
  "/:callId/recording/start",
  [authMiddleware, validateCallRequest, validateRecordingPermission],
  startRecording
);

router.post(
  "/:callId/recording/stop",
  [authMiddleware, validateCallRequest, validateRecordingPermission],
  stopRecording
);

router.get("/:callId/recording", [authMiddleware], getRecording);

// Call Quality Management
router.patch(
  "/:callId/quality",
  [authMiddleware, validateCallRequest],
  adjustCallQuality
);

router.get("/:callId/stats", [authMiddleware], getCallStats);

// Participant Controls
router.post(
  "/:callId/participants/:userId/mute",
  [authMiddleware, validateCallRequest],
  muteParticipant
);

router.post(
  "/:callId/participants/:userId/video",
  [authMiddleware, validateCallRequest],
  toggleParticipantVideo
);

// Call Scheduling
router.post(
  "/schedule",
  [authMiddleware, validateCallRequest, validateScheduling],
  scheduleCall
);

router.get("/scheduled", [authMiddleware], getScheduledCalls);

router.patch(
  "/scheduled/:callId",
  [authMiddleware, validateCallRequest, validateScheduling],
  updateScheduledCall
);

router.delete("/scheduled/:callId", [authMiddleware], cancelScheduledCall);

// Background Effects
router.post(
  "/:callId/background/blur",
  [authMiddleware, validateCallRequest],
  toggleBackgroundBlur
);

router.post(
  "/:callId/background/virtual",
  [authMiddleware, validateCallRequest],
  setVirtualBackground
);

// Call History and Details
router.get("/history", [authMiddleware], getCallHistory);

router.get("/:callId", [authMiddleware], getCallDetails);

export default router;
