import Post from "../../models/Post.js";
import Reel from "../../models/Reel.js";

export const getFeedPostsService = async (page, limit) => {
  const skip = (page - 1) * limit;

  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("userId", "username profilePicture");

  const total = await Post.countDocuments();

  return {
    posts,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalPosts: total,
  };
};

export const getFeedReelsService = async (page, limit) => {
  const skip = (page - 1) * limit;

  const reels = await Reel.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("userId", "username profilePicture");

  const total = await Reel.countDocuments();

  return {
    reels,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalReels: total,
  };
};
