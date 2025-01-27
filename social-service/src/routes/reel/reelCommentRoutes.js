import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import {
  createComment,
  deleteComment,
  getComments,
  likeComment,
  unlikeComment,
  replyToComment,
  deleteReply,
} from "../../controllers/reel/reelCommentController.js";
import { validateComment } from "../../middlewares/validationMiddleware.js";

const router = express.Router();

// Base route: /api/reels/:reelId/comments

// Get all comments for a reel
router.get("/:reelId/comments", authMiddleware, getComments);

// Create a new comment on a reel
router.post(
  "/:reelId/comments",
  authMiddleware,
  validateComment,
  createComment
);

// Delete a comment
router.delete("/:reelId/comments/:commentId", authMiddleware, deleteComment);

// Like a comment
router.post("/:reelId/comments/:commentId/like", authMiddleware, likeComment);

// Unlike a comment
router.delete(
  "/:reelId/comments/:commentId/like",
  authMiddleware,
  unlikeComment
);

// Reply to a comment
router.post(
  "/:reelId/comments/:commentId/reply",
  authMiddleware,
  validateComment,
  replyToComment
);

// Delete a reply to a comment
router.delete(
  "/:reelId/comments/:commentId/replies/:replyId",
  authMiddleware,
  deleteReply
);

export default router;
