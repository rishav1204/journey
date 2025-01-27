import express from "express";
import {
  followUser,
  unfollowUser,
  getFollowing,
  sendFollowRequest,
  acceptFollowRequest,
  rejectFollowRequest,
} from "../../controllers/interaction/followController.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/:userId", authMiddleware, followUser);
router.delete("/:userId", authMiddleware, unfollowUser);
router.get("/following-list", authMiddleware, getFollowing);
router.post("/request/:userId", authMiddleware, sendFollowRequest);
router.post("/accept/:userId", authMiddleware, acceptFollowRequest);
router.post("/reject/:userId", authMiddleware, rejectFollowRequest);

export default router;

