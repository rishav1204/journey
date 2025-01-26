import {
  savePostService,
  unsavePostService,
} from "../../services/post/postSaveServices.js";

export const savePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    await savePostService(postId, userId);

    res.status(200).json({
      success: true,
      message: "Post saved successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const unsavePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    await unsavePostService(postId, userId);

    res.status(200).json({
      success: true,
      message: "Post unsaved successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


