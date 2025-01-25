import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  sharePost,
} from "../controllers/post/postShareController.js";

const router = express.Router();

router.post("/:postId/share", authMiddleware, sharePost);

export default router;
