import express from "express";
import {
  blockUser,
  unblockUser,
  getBlockedUsers,
} from "../../controllers/interaction/blockController.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/:userId", authMiddleware, blockUser);
router.delete("/:userId", authMiddleware, unblockUser);
router.get("/blocked-user-list", authMiddleware, getBlockedUsers);


export default router;
