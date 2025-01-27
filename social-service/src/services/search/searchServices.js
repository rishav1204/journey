import User from "../../models/User.js";
import Post from "../../models/Post.js";
import Reel from "../../models/Reel.js";
import Block from "../../models/block.js";

// Helper to get blocked user IDs
const getBlockedUserIds = async (viewerId) => {
  const blockedUsers = await Block.find({
    $or: [{ userId: viewerId }, { blockedBy: viewerId }],
  });
  return blockedUsers.map((block) =>
    block.userId.equals(viewerId) ? block.blockedBy : block.userId
  );
};

// Helper for pagination
const getPaginationData = (total, page, limit) => ({
  currentPage: parseInt(page),
  totalPages: Math.ceil(total / parseInt(limit)),
  totalResults: total,
});

export const searchUsersService = async (
  query,
  page = 1,
  limit = 10,
  viewerId
) => {
  const skip = (page - 1) * limit;
  const blockedUserIds = await getBlockedUserIds(viewerId);

  const users = await User.find({
    $and: [
      {
        $or: [
          { username: { $regex: query, $options: "i" } },
          { firstName: { $regex: query, $options: "i" } },
          { lastName: { $regex: query, $options: "i" } },
        ],
      },
      { _id: { $nin: blockedUserIds } },
    ],
  })
    .select(
      "username firstName lastName profilePicture bio followersCount followingCount"
    )
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments({
    $and: [
      {
        $or: [
          { username: { $regex: query, $options: "i" } },
          { firstName: { $regex: query, $options: "i" } },
          { lastName: { $regex: query, $options: "i" } },
        ],
      },
      { _id: { $nin: blockedUserIds } },
    ],
  });

  return {
    users,
    ...getPaginationData(total, page, limit),
  };
};

export const searchPostsService = async (
  query,
  page = 1,
  limit = 10,
  viewerId
) => {
  const skip = (page - 1) * limit;
  const blockedUserIds = await getBlockedUserIds(viewerId);

  const posts = await Post.find({
    $and: [
      {
        $or: [
          { caption: { $regex: query, $options: "i" } },
          { location: { $regex: query, $options: "i" } },
          { tags: { $in: [new RegExp(query, "i")] } },
        ],
      },
      { userId: { $nin: blockedUserIds } },
      { isPrivate: false },
    ],
  })
    .populate("userId", "username firstName lastName profilePicture")
    .select("caption media location tags likesCount commentsCount createdAt")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Post.countDocuments({
    $and: [
      {
        $or: [
          { caption: { $regex: query, $options: "i" } },
          { location: { $regex: query, $options: "i" } },
          { tags: { $in: [new RegExp(query, "i")] } },
        ],
      },
      { userId: { $nin: blockedUserIds } },
      { isPrivate: false },
    ],
  });

  return {
    posts,
    ...getPaginationData(total, page, limit),
  };
};

export const searchReelsService = async (
  query,
  page = 1,
  limit = 10,
  viewerId
) => {
  const skip = (page - 1) * limit;
  const blockedUserIds = await getBlockedUserIds(viewerId);

  const reels = await Reel.find({
    $and: [
      {
        $or: [
          { caption: { $regex: query, $options: "i" } },
          { musicName: { $regex: query, $options: "i" } },
          { tags: { $in: [new RegExp(query, "i")] } },
        ],
      },
      { userId: { $nin: blockedUserIds } },
      { isPrivate: false },
    ],
  })
    .populate("userId", "username firstName lastName profilePicture")
    .select(
      "caption video musicName tags viewsCount likesCount commentsCount createdAt"
    )
    .skip(skip)
    .limit(limit)
    .sort({ viewsCount: -1 });

  const total = await Reel.countDocuments({
    $and: [
      {
        $or: [
          { caption: { $regex: query, $options: "i" } },
          { musicName: { $regex: query, $options: "i" } },
          { tags: { $in: [new RegExp(query, "i")] } },
        ],
      },
      { userId: { $nin: blockedUserIds } },
      { isPrivate: false },
    ],
  });

  return {
    reels,
    ...getPaginationData(total, page, limit),
  };
};

export const searchByLocationService = async (
  location,
  page = 1,
  limit = 10,
  viewerId
) => {
  try {
    const skip = (page - 1) * limit;
    const blockedUserIds = await getBlockedUserIds(viewerId);

    // Clean location query
    const cleanLocation = location.trim();
    console.log("Searching for location:", cleanLocation);

    const query = {
      $and: [
        {
          location: {
            $regex: cleanLocation,
            $options: "i",
          },
        },
        { userId: { $nin: blockedUserIds } },
        { isPrivate: { $ne: true } },
      ],
    };

    console.log("Query:", JSON.stringify(query, null, 2));

    const [posts, reels] = await Promise.all([
      Post.find(query)
        .populate("userId", "username firstName lastName profilePicture")
        .select("caption media tags likes comments createdAt location")
        .skip(skip)
        .limit(limit)
        .lean(),

      Reel.find(query)
        .populate("userId", "username firstName lastName profilePicture")
        .select("caption video tags viewsCount likes createdAt location")
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const [totalPosts, totalReels] = await Promise.all([
      Post.countDocuments(query),
      Reel.countDocuments(query),
    ]);

    return {
      posts,
      reels,
      metadata: {
        postsCount: totalPosts,
        reelsCount: totalReels,
        currentPage: parseInt(page),
        totalPages: Math.ceil((totalPosts + totalReels) / parseInt(limit)),
        limit: parseInt(limit),
      },
    };
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
};

export const searchByTagsService = async (
  tag,
  page = 1,
  limit = 10,
  viewerId
) => {
  try {
    const skip = (page - 1) * limit;
    const blockedUserIds = await getBlockedUserIds(viewerId);

    // Clean and format the search tag
    const cleanTag = tag.startsWith("%23")
      ? `#${tag.substring(3)}`
      : tag.startsWith("#")
      ? tag
      : `#${tag}`;

    console.log("Searching for tag:", cleanTag);

    const query = {
      $and: [
        { tags: cleanTag }, // Exact match since tags are stored with # prefix
        { userId: { $nin: blockedUserIds } },
        { isPrivate: { $ne: true } },
      ],
    };

    console.log("Query:", JSON.stringify(query, null, 2));

    const [posts, reels] = await Promise.all([
      Post.find(query)
        .populate("userId", "username firstName lastName profilePicture")
        .select("caption media tags likes comments createdAt location")
        .skip(skip)
        .limit(limit)
        .lean(),

      Reel.find(query)
        .populate("userId", "username firstName lastName profilePicture")
        .select("caption video tags viewsCount likes createdAt")
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    // Get total counts for pagination
    const [totalPosts, totalReels] = await Promise.all([
      Post.countDocuments(query),
      Reel.countDocuments(query),
    ]);

    return {
      posts,
      reels,
      metadata: {
        postsCount: totalPosts,
        reelsCount: totalReels,
        currentPage: parseInt(page),
        totalPages: Math.ceil((totalPosts + totalReels) / parseInt(limit)),
        limit: parseInt(limit),
      },
    };
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
};
