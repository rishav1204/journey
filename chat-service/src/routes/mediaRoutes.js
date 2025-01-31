// src/routes/mediaRoutes.js
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { uploadMiddleware } from "../middlewares/uploadMiddleware.js";
import {
  uploadVideo,
  uploadDocument,
  uploadVoiceNote,
  uploadGif,
  uploadSticker,
  uploadMultipleFiles,
  toggleCompression,
  startVoiceRecording,
  stopVoiceRecording,
  getVoiceNoteInfo,
  deleteVoiceNote,
  generateWaveform,
} from "../controllers/mediaController.js";
import rateLimit from "express-rate-limit";

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 uploads per windowMs
});

const router = Router();

// Upload multiple files (images/videos) at once
router.post(
  "/upload/multiple",
  uploadLimiter,
  authMiddleware,
  uploadMiddleware.array("files", 10), // 'files' is the field name, 10 is max count
  uploadMultipleFiles
);

router.post(
  "/upload/video",
  uploadLimiter,
  authMiddleware,
  uploadMiddleware.single("video"),
  uploadVideo
);

router.post(
  "/upload/document",
  uploadLimiter,
  authMiddleware,
  uploadMiddleware.single("document"),
  uploadDocument
);

router.post(
  "/upload/voice",
  uploadLimiter,
  authMiddleware,
  uploadMiddleware.single("audio"),
  uploadVoiceNote
);

// Start voice recording session
router.post(
  "/voice/start", 
  authMiddleware,
  startVoiceRecording
);

// Stop and save voice recording
router.post(
  "/voice/stop",
  authMiddleware, 
  uploadMiddleware.single("audio"),
  stopVoiceRecording
);

// Get voice note details including waveform
router.get(
  "/voice/:voiceNoteId",
  authMiddleware,
  getVoiceNoteInfo
);

// Delete voice note
router.delete(
  "/voice/:voiceNoteId",
  authMiddleware,
  deleteVoiceNote
);

// Get waveform data for visualization
router.get(
  "/voice/:voiceNoteId/waveform",
  authMiddleware,
  generateWaveform
);

router.post(
  "/upload/gif",
  uploadLimiter,
  authMiddleware,
  uploadMiddleware.single("gif"),
  uploadGif
);

router.post(
  "/upload/sticker",
    uploadLimiter,
  authMiddleware,
  uploadMiddleware.single("sticker"),
  uploadSticker
);

// Toggle compression settings
router.post("/compression/toggle", authMiddleware, toggleCompression);

export default router;
