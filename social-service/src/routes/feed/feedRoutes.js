import express from "express";
import {
  getFeedPosts,
  getFeedReels,
} from "../../controllers/feed/feedController.js";
import { validatePagination } from "../../middlewares/validationMiddleware.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/posts", authMiddleware, validatePagination, getFeedPosts);
router.get("/reels", authMiddleware, validatePagination, getFeedReels);

export default router;
