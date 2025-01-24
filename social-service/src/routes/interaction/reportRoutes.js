import express from "express";
import {
  reportUser,
  reportPost,
  reportReel,
  getReports,
} from "../../controllers/interaction/reportController.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { authorizeRole } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/user/:userId", authMiddleware, reportUser);
router.post("/post/:postId", authMiddleware, reportPost);
router.post("/reel/:reelId", authMiddleware, reportReel);
router.get("/reports-list", authMiddleware, authorizeRole(["admin"]), getReports);

export default router;

