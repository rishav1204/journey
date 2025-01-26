import { sharePostService } from "../../services/post/postShareServices.js";

export const sharePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { recipientId, message } = req.body;
    const userId = req.user.id;

    const sharedPost = await sharePostService(
      postId,
      userId,
      recipientId,
      message
    );

    res.status(200).json({
      success: true,
      message: "Post shared successfully",
      data: sharedPost,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
