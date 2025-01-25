import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  createPost,
  deletePost,
  getPostDetails,
  likePost,
  unlikePost,
  savePost,
  unsavePost,
  sharePost,
} from "../controllers/post/postController.js";

const router = express.Router();


// Post CRUD operations
router.post("/create-post", authMiddleware, createPost);
router.get("/:postId/details", authMiddleware, getPostDetails);
router.delete("/:postId", authMiddleware, deletePost);

// Post interactions
router.post("/:postId/like", authMiddleware, likePost);
router.delete("/:postId/like", authMiddleware, unlikePost);
router.post("/:postId/save", authMiddleware, savePost);
router.delete("/:postId/save", authMiddleware, unsavePost);
router.post("/:postId/share", authMiddleware, sharePost);

export default router;
