import Follower from "../../models/Follower.js";
import { checkBlockStatus } from "./blockService.js";

export const getFollowersService = async (userId) => {
  const followers = await Follower.find({
    followingUserId: userId,
  })
    .populate("userId", "username profilePicture bio")
    .sort({ followedAt: -1 });

  // Filter out blocked users
  const validFollowers = await Promise.all(
    followers.map(async (follow) => {
      const isBlocked = await checkBlockStatus(userId, follow.userId._id);
      return isBlocked ? null : follow;
    })
  );

  return validFollowers.filter(Boolean);
};

export const removeFollowerService = async (followerId, userId) => {
  const session = await Follower.startSession();
  session.startTransaction();

  try {
    const removedFollower = await Follower.findOneAndDelete({
      userId: followerId,
      followingUserId: userId,
    }).session(session);

    if (!removedFollower) {
      throw new Error("Follower relationship not found");
    }

    await session.commitTransaction();
    return removedFollower;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getFollowerRequestsService = async (userId) => {
  // For follower requests, we need a separate FollowRequest model
  // or add a status field to the Follower model
  // Here's how it would work with a status field:

  const requests = await Follower.find({
    followingUserId: userId,
    status: "pending", // You'll need to add this field to your schema
  })
    .populate("userId", "username profilePicture bio")
    .sort({ followedAt: -1 });

  const validRequests = await Promise.all(
    requests.map(async (request) => {
      const isBlocked = await checkBlockStatus(userId, request.userId._id);
      return isBlocked ? null : request;
    })
  );

  return validRequests.filter(Boolean);
};

