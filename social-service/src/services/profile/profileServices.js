import User from "../../../../user-service/src/database/models/User.js";
import Post from "../../models/Post.js";
import Reel from "../../models/Reel.js";
import Save from "../../models/Save.js";
import Follow from "../../models/Follow.js";
import Block from "../../models/Block.js";

const checkPrivacyAccess = async (userId, viewerId) => {
  // Self access - always allowed
  if (userId === viewerId) return true;

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Use the correct field from User model
  if (user.privacySettings.isProfilePublic) return true;

  const isFollower = await Follow.findOne({
    userId: viewerId,
    followingUserId: userId,
    status: "accepted",
  });

  return !!isFollower;
};

export const getProfileService = async (userId, viewerId) => {
  // Check if user is blocked
  const isBlocked = await Block.findOne({
    $or: [
      { blockedUser: userId, blockedBy: viewerId },
      { blockedUser: viewerId, blockedBy: userId },
    ],
  });

  if (isBlocked) {
    throw new Error("Cannot view this profile");
  }

  const user = await User.findById(userId).select(
    "username email profilePicture bio location socialMediaLinks privacySettings createdAt"
  );

  if (!user) {
    throw new Error("User not found");
  }

  const hasAccess = await checkPrivacyAccess(userId, viewerId);
  const isFollowing = await Follow.findOne({
    userId: viewerId,
    followingUserId: userId,
    status: "accepted",
  });

  return {
    ...user.toObject(),
    isFollowing: !!isFollowing,
    hasAccess,
  };
};

export const getPostsService = async (userId, page, limit, viewerId) => {
  const hasAccess = await checkPrivacyAccess(userId, viewerId);
  if (!hasAccess) {
    throw new Error("This account is private");
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [posts, total] = await Promise.all([
    Post.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "username profilePicture")
      .populate("likes", "username profilePicture"),
    Post.countDocuments({ userId }),
  ]);

  return {
    posts,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalPosts: total,
  };
};

export const getReelsService = async (userId, page, limit, viewerId) => {
  const hasAccess = await checkPrivacyAccess(userId, viewerId);
  if (!hasAccess) {
    throw new Error("This account is private");
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [reels, total] = await Promise.all([
    Reel.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "username profilePicture"),
    Reel.countDocuments({ userId }),
  ]);

  return {
    reels,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalReels: total,
  };
};

export const getSavedPostsService = async (userId, page, limit, viewerId) => {
  if (userId !== viewerId) {
    throw new Error("Cannot view other users' saved posts");
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [savedPosts, total] = await Promise.all([
    Save.find({ userId, contentType: "post" })
      .sort({ savedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: "contentId",
        populate: {
          path: "userId",
          select: "username profilePicture",
        },
      }),
    Save.countDocuments({ userId, contentType: "post" }),
  ]);

  return {
    savedPosts,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalSaved: total,
  };
};

export const getSavedReelsService = async (userId, page, limit, viewerId) => {
  if (userId !== viewerId) {
    throw new Error("Cannot view other users' saved reels");
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [savedReels, total] = await Promise.all([
    Save.find({ userId, contentType: "reel" })
      .sort({ savedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: "contentId",
        populate: {
          path: "userId",
          select: "username profilePicture",
        },
      }),
    Save.countDocuments({ userId, contentType: "reel" }),
  ]);

  return {
    savedReels,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalSaved: total,
  };
};

export const getStatsService = async (userId, viewerId) => {
  const hasAccess = await checkPrivacyAccess(userId, viewerId);

  const [postsCount, reelsCount, followersCount, followingCount] =
    await Promise.all([
      hasAccess ? Post.countDocuments({ userId }) : 0,
      hasAccess ? Reel.countDocuments({ userId }) : 0,
      Follow.countDocuments({ followingUserId: userId, status: "accepted" }),
      Follow.countDocuments({ userId, status: "accepted" }),
    ]);

  return {
    postsCount,
    reelsCount,
    followersCount,
    followingCount,
    isPrivate: !hasAccess,
  };
};
