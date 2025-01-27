import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import {
  saveReel,
  unsaveReel,
} from "../../controllers/reel/reelSaveController.js";

const router = express.Router();

router.post("/:reelId/save", authMiddleware, saveReel);
router.delete("/:reelId/save", authMiddleware, unsaveReel);

export default router;
