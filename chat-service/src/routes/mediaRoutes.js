import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// Upload image with optional compression
router.post("/upload/image", authMiddleware, uploadImage);

// Upload video with optional quality settings
router.post("/upload/video", authMiddleware, uploadVideo);

// Share documents (PDF, DOC, etc)
router.post("/upload/document", authMiddleware, uploadDocument);

// Record and send voice messages
router.post("/upload/voice", authMiddleware, uploadVoiceNote);

// Share GIFs from library/gallery
router.post("/upload/gif", authMiddleware, uploadGif);

// Share stickers from collection
router.post("/upload/sticker", authMiddleware, uploadSticker);

// Toggle media compression settings
router.post("/compression/toggle", authMiddleware, toggleCompression);

export default router;
