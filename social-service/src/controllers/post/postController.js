import { promises as fs } from "fs";
import {
  createPostService,
  deletePostService,
  getPostDetailsService,
  likePostService,
  unlikePostService,
} from "../../services/post/postServices.js";
import mongoose from "mongoose";

export const createPost = async (req, res) => {
  try {
    const { caption, location, tags } = req.body;
    const media = req.files;
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

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
    // Clean up uploaded files if there's an error
    if (req.files) {
      await Promise.all(
        req.files.map((file) => fs.unlink(file.path).catch(() => {}))
      );
    }
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

    // Validate postId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid postId format",
      });
    }

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


