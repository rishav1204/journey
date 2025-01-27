import mongoose from "mongoose";
import Block from "../../models/block.js";
import User from "../../models/User.js";
import Follower from "../../models/Follower.js";

export const blockUserService = async (userId, blockedBy) => {
  const session = await mongoose.startSession();

  try {
    // Start transaction
    session.startTransaction();

    // All operations with same session
    const userToBlock = await User.findById(userId).session(session);
    const blockingUser = await User.findById(blockedBy).session(session);

    if (!userToBlock || !blockingUser) {
      throw new Error("User not found");
    }

    const existingBlock = await Block.findOne({
      userId,
      blockedBy,
    }).session(session);

    if (existingBlock) {
      throw new Error("User is already blocked");
    }

    // Single operation for follow removal
    await Follower.deleteMany({
      $or: [
        { userId: blockedBy, followingUserId: userId },
        { userId: userId, followingUserId: blockedBy },
      ],
    }).session(session);

    // Create block with same session
    const block = await Block.create(
      [
        {
          userId,
          blockedBy,
          createdAt: new Date(),
        },
      ],
      { session }
    );

    // Commit the transaction
    await session.commitTransaction();
    return block[0];
  } catch (error) {
    // Only abort if in transaction
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    await session.endSession();
  }
};

export const unblockUserService = async (userId, unblockedBy) => {
  const session = await Block.startSession();
  session.startTransaction();

  try {
    // Remove from blocked list
    const block = await Block.findOneAndDelete({
      userId,
      blockedBy: unblockedBy,
    }).session(session);

    if (!block) {
      throw new Error("Block not found");
    }

    // At this point users can send follow requests to each other
    // No automatic follow relationship is created
    // They must explicitly send follow requests

    await session.commitTransaction();
    return {
      message:
        "User unblocked successfully. You can now send a follow request.",
      unblockData: block,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getBlockedUsersService = async (userId) => {
  const blockedUsers = await Block.find({ blockedBy: userId })
    .populate("userId", "username profilePicture")
    .sort({ createdAt: -1 });

  return blockedUsers;
};

// Helper function to check if users are blocked
export const checkBlockStatus = async (userA, userB) => {
  const blockExists = await Block.findOne({
    $or: [
      { userId: userA, blockedBy: userB },
      { userId: userB, blockedBy: userA },
    ],
  });

  return !!blockExists;
};
