import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import {
  savePost,
  unsavePost,
} from "../../controllers/post/postSaveController.js";

const router = express.Router();

router.post("/:postId/save", authMiddleware, savePost);
router.delete("/:postId/save", authMiddleware, unsavePost);

export default router;
