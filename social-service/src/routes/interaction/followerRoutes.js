import express from "express";
import {
  getFollowers,
  removeFollower,
  getFollowerRequests,
} from "../../controllers/interaction/followerController.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/followers-list", authMiddleware, getFollowers);
router.delete("/:userId", authMiddleware, removeFollower);
router.get("/requests", authMiddleware, getFollowerRequests);

export default router;
