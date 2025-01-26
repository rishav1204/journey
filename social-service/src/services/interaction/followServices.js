import Follower from "../../models/Follower.js";
import User from "../../../../user-service/src/database/models/User.js";
import { checkBlockStatus } from "./blockServices.js";

export const followUserService = async (userId, followerId) => {
  const session = await Follower.startSession();
  session.startTransaction();

  try {
    // Check if users exist
    const [userToFollow, followerUser] = await Promise.all([
      User.findById(userId),
      User.findById(followerId),
    ]);

    if (!userToFollow || !followerUser) {
      throw new Error("User not found");
    }

    // Check if blocked
    const isBlocked = await checkBlockStatus(userId, followerId);
    if (isBlocked) {
      throw new Error("Cannot follow this user");
    }

    // Check if already following
    const existingFollow = await Follower.findOne({
      userId: followerId,
      followingUserId: userId,
    });

    if (existingFollow) {
      throw new Error("Already following this user");
    }

    // Create follow relationship
      const follow = await Follower.create([{
          userId: followerId,
          followingUserId: userId,
          status: userToFollow.privacySettings.isProfilePublic ? 'accepted' : 'pending'
      }],
      { session }
    );

    await session.commitTransaction();
    return follow[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
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
