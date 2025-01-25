import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  createComment,
  deleteComment,
  getComments,
  likeComment,
  unlikeComment,
  replyToComment,
  deleteReply,
} from "../controllers/interaction/commentController.js";
import { validateComment } from "../middlewares/validationMiddleware.js";

const router = express.Router();

// Base route: /api/posts/:postId/comments

// Get all comments for a post
router.get("/:postId/comments", authMiddleware, getComments);

// Create a new comment on a post
router.post("/:postId/comments", authMiddleware, validateComment, createComment);

// Delete a comment
router.delete("/:postId/comments/:commentId", authMiddleware, deleteComment);

// Like/Unlike a comment
router.post("/:postId/comments/:commentId/like", authMiddleware, likeComment);

// Unlike a comment
router.delete(
  "/:postId/comments/:commentId/like",
  authMiddleware,
  unlikeComment
);


// Reply to a comment
router.post(
  "/:postId/comments/:commentId/reply",
  authMiddleware,
  validateComment,
  replyToComment
);

// Delete a reply to a comment
router.delete(
  "/:postId/comments/:commentId/replies/:replyId",
  authMiddleware,
  deleteReply
);

export default router;
