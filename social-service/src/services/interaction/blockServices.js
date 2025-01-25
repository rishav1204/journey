import Block from "../../models/block.js";
import User from "../../models/User.js";
import Follow from "../../models/Follow.js";

export const blockUserService = async (userId, blockedBy) => {
  const session = await Block.startSession();
  session.startTransaction();

  try {
    // Check if users exist
    const [userToBlock, blockingUser] = await Promise.all([
      User.findById(userId),
      User.findById(blockedBy),
    ]);

    if (!userToBlock || !blockingUser) {
      throw new Error("User not found");
    }

    // Check if already blocked
    const existingBlock = await Block.findOne({ userId, blockedBy });
    if (existingBlock) {
      throw new Error("User is already blocked");
    }

    // Remove from followers and following
    await Promise.all([
      // Remove userB from userA's following
      Follow.findOneAndDelete({ follower: blockedBy, following: userId }),
      // Remove userA from userB's following
      Follow.findOneAndDelete({ follower: userId, following: blockedBy }),
      // Remove userB from userA's followers
      Follow.findOneAndDelete({ follower: userId, following: blockedBy }),
      // Remove userA from userB's followers
      Follow.findOneAndDelete({ follower: blockedBy, following: userId }),
    ]);

    // Create new block
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

    await session.commitTransaction();
    return block[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
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
