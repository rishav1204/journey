import {
  getProfileService,
  getPostsService,
  getReelsService,
  getSavedPostsService,
  getSavedReelsService,
  getStatsService,
} from "../../services/profile/profileServices.js";

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const viewerId = req.user.id;

    const profile = await getProfileService(userId, viewerId);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const posts = await getPostsService(userId, page, limit);

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user posts",
      error: error.message,
    });
  }
};


export const getUserReels = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reels = await getReelsService(userId, page, limit);

    res.status(200).json({
      success: true,
      data: reels
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user reels",
      error: error.message
    });
  }
};

export const getUserSavedPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const viewerId = req.user.id;

    // Only allow users to view their own saved posts
    if (userId !== viewerId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view saved posts"
      });
    }

    const savedPosts = await getSavedPostsService(userId, page, limit, viewerId);

    res.status(200).json({
      success: true,
      data: savedPosts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching saved posts",
      error: error.message
    });
  }
};

export const getUserSavedReels = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const viewerId = req.user.id;

    // Only allow users to view their own saved reels
    if (userId !== viewerId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view saved reels"
      });
    }

    const savedReels = await getSavedReelsService(userId, page, limit, viewerId);

    res.status(200).json({
      success: true,
      data: savedReels
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching saved reels",
      error: error.message
    });
  }
};


export const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await getStatsService(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user stats",
      error: error.message,
    });
  }
};
