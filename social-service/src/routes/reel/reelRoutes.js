import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { upload } from "../../middlewares/uploadMiddleware.js";
import {
  createReel,
  deleteReel,
  getReelDetails,
  likeReel,
  unlikeReel,
} from "../../controllers/reel/reelController.js";

const router = express.Router();

// Reel CRUD operations
router.post(
  "/create-reel",
  authMiddleware,
  upload.single("video"), // Single video upload for reels
  createReel
);
router.get("/:reelId/details", authMiddleware, getReelDetails);
router.delete("/:reelId", authMiddleware, deleteReel);

// Reel interactions
router.post("/:reelId/like", authMiddleware, likeReel);
router.delete("/:reelId/like", authMiddleware, unlikeReel);

export default router;
