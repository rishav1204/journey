import {
  createPostService,
  deletePostService,
  getPostDetailsService,
  likePostService,
  unlikePostService,
  savePostService,
  unsavePostService,
  sharePostService,
} from "../../services/post/postService.js";

export const createPost = async (req, res) => {
  try {
    const { caption, location, tags } = req.body;
    const media = req.files; // Array of uploaded files
    const userId = req.user.id;

    const post = await createPostService(userId, {
      caption,
      location,
      tags,
      media,
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating post",
      error: error.message,
    });
  }
};

export const getPostDetails = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await getPostDetailsService(postId, userId);

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching post details",
      error: error.message,
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    await deletePostService(postId, userId);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting post",
      error: error.message,
    });
  }
};

export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await likePostService(postId, userId);

    res.status(200).json({
      success: true,
      message: "Post liked successfully",
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error liking post",
      error: error.message,
    });
  }
};

export const unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    await unlikePostService(postId, userId);

    res.status(200).json({
      success: true,
      message: "Post unliked successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error unliking post",
      error: error.message,
    });
  }
};

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
    res.status(500).json({
      success: false,
      message: "Error saving post",
      error: error.message,
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
    res.status(500).json({
      success: false,
      message: "Error unsaving post",
      error: error.message,
    });
  }
};

export const sharePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    await sharePostService(postId, userId);

    res.status(200).json({
      success: true,
      message: "Post shared successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sharing post",
      error: error.message,
    });
  }
};
