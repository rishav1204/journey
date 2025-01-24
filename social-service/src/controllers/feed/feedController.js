import {
  getFeedPostsService,
  getFeedReelsService,
} from "../../services/feed/feedService.js";

export const getFeedPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const feedPosts = await getFeedPostsService(page, limit);

    res.status(200).json({
      success: true,
      data: feedPosts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching posts feed",
      error: error.message,
    });
  }
};


export const getFeedReels = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const feedReels = await getFeedReelsService(page, limit);

    res.status(200).json({
      success: true,
      data: feedReels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching reels feed",
      error: error.message,
    });
  }
};
