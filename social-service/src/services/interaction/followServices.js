import mongoose from "mongoose";
import User from "../../models/User.js";
import Follower from "../../models/Follower.js";
import { checkBlockStatus } from "../interaction/blockServices.js";

export const followUserService = async (userId, followerId) => {
  const session = await mongoose.startSession();

  try {
    // Start transaction
    session.startTransaction();

    // All operations must use the same session
    const userToFollow = await User.findById(userId).session(session);
    const followerUser = await User.findById(followerId).session(session);

    if (!userToFollow || !followerUser) {
      await session.abortTransaction();
      throw new Error("User not found");
    }

    // Use session for block check
    const isBlocked = await checkBlockStatus(userId, followerId);
    if (isBlocked) {
      await session.abortTransaction();
      throw new Error("Cannot follow this user");
    }

    // Check existing follow with session
    const existingFollow = await Follower.findOne({
      userId: followerId,
      followingUserId: userId,
    }).session(session);

    if (existingFollow) {
      await session.abortTransaction();
      throw new Error("Already following this user");
    }

    // Create follow with session
    const follow = await Follower.create(
      [
        {
          userId: followerId,
          followingUserId: userId,
          status: userToFollow.privacySettings?.isProfilePublic
            ? "accepted"
            : "pending",
        },
      ],
      { session }
    );

    // Commit if all operations succeed
    await session.commitTransaction();
    return follow[0];
  } catch (error) {
    // Only abort if transaction is active
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    await session.endSession();
  }
};

export const unfollowUserService = async (userId, followerId) => {
  const session = await Follower.startSession();
  session.startTransaction();

  try {
    const unfollow = await Follower.findOneAndDelete({
      userId: followerId,
      followingUserId: userId,
    }).session(session);

    if (!unfollow) {
      throw new Error("Follow relationship not found");
    }

    await session.commitTransaction();
    return unfollow;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getFollowingService = async (userId) => {
  const following = await Follower.find({
    userId,
    status: "accepted",
  })
    .populate("followingUserId", "username profilePicture bio")
    .sort({ followedAt: -1 });

  // Filter out blocked users
  const validFollowing = await Promise.all(
    following.map(async (follow) => {
      const isBlocked = await checkBlockStatus(
        userId,
        follow.followingUserId._id
      );
      return isBlocked ? null : follow;
    })
  );

  return validFollowing.filter(Boolean);
};

export const sendFollowRequestService = async (userId, followerId) => {
  return await followUserService(userId, followerId);
};

export const acceptFollowRequestService = async (userId, currentUserId) => {
  const session = await Follower.startSession();
  session.startTransaction();

  try {
    const followRequest = await Follower.findOne({
      userId,
      followingUserId: currentUserId,
      status: "pending",
    });

    if (!followRequest) {
      throw new Error("Follow request not found");
    }

    followRequest.status = "accepted";
    await followRequest.save({ session });

    await session.commitTransaction();
    return followRequest;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const rejectFollowRequestService = async (userId, currentUserId) => {
  const session = await Follower.startSession();
  session.startTransaction();

  try {
    const rejectedRequest = await Follower.findOneAndDelete({
      userId,
      followingUserId: currentUserId,
      status: "pending",
    }).session(session);

    if (!rejectedRequest) {
      throw new Error("Follow request not found");
    }

    await session.commitTransaction();
    return rejectedRequest;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
