import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { shareReel } from "../../controllers/reel/reelShareController.js";

const router = express.Router();

router.post("/:reelId/share", authMiddleware, shareReel);

export default router;
