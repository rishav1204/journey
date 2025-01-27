import { sharePostService } from "../../services/post/postShareServices.js";

// In postShareController.js
export const sharePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { sharedTo, message } = req.body;
    const userId = req.user.id; // Change from req.user.userId to req.user.id

    const result = await sharePostService(postId, userId, sharedTo, message);

    res.status(200).json({
      success: true,
      message: "Post shared successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Share failed", 
      error: `Share failed: ${error.message}`
    });
  }
};