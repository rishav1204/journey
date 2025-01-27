import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { uploadImages } from "../../middlewares/uploadMiddleware.js";
import {
  createPost,
  deletePost,
  getPostDetails,
  likePost,
  unlikePost
} from "../../controllers/post/postController.js";

const router = express.Router();


// Post CRUD operations
router.post("/create-post", authMiddleware, uploadImages, createPost);
router.get("/:postId/details", authMiddleware, getPostDetails);
router.delete("/:postId", authMiddleware, deletePost);

// Post interactions
router.post("/:postId/like", authMiddleware, likePost);
router.delete("/:postId/like", authMiddleware, unlikePost);

export default router;
