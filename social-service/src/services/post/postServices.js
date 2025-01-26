import { promises as fs } from "fs";
import mongoose from "mongoose";
import Post from "../../models/Post.js";
import Save from "../../models/Save.js";
import Comment from "../../models/Comment.js";
import User from "../../models/User.js";
import {
  uploadPostMedia,
  deleteFromCloudinary,
} from "../../utils/cloudinary.js";

export const createPostService = async (userId, postData) => {
  const { caption, location, tags, media } = postData;
  const uploadedMedia = [];
  const session = await mongoose.startSession();
  let hasCommitted = false;

  try {
    // First verify user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    session.startTransaction();

    // Upload media files
    for (const file of media) {
      try {
        const result = await uploadPostMedia(file);
        uploadedMedia.push({
          url: result.url,
          publicId: result.publicId,
          type: result.type,
          width: result.width,
          height: result.height,
          duration: result.duration,
        });
        await fs.unlink(file.path);
      } catch (error) {
        throw new Error(
          `Failed to upload ${file.originalname}: ${error.message}`
        );
      }
    }

    const post = await Post.create(
      [
        {
          userId,
          caption,
          location,
          tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
          media: uploadedMedia,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    hasCommitted = true;

    return await post[0].populate("userId", "username profilePicture");
  } catch (error) {
    if (!hasCommitted) {
      await session.abortTransaction();
    }
    await Promise.all(
      uploadedMedia.map((m) => deleteFromCloudinary(m.publicId).catch(() => {}))
    );
    throw error;
  } finally {
    session.endSession();
  }
};

export const deletePostService = async (postId, userId) => {
  const post = await Post.findOne({ _id: postId, userId });

  if (!post) {
    throw new Error("Post not found or unauthorized");
  }

  try {
    // Delete media from Cloudinary
    await Promise.all(post.media.map((m) => deleteFromCloudinary(m.publicId)));

    await post.deleteOne();
  } catch (error) {
    throw new Error(`Failed to delete post: ${error.message}`);
  }
};

export const likePostService = async (postId, userId) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new Error("Post not found");
  }

  if (post.likes.includes(userId)) {
    throw new Error("Post already liked");
  }

  post.likes.push(userId);
  await post.save();

  return post.populate("userId", "username profilePicture");
};

export const unlikePostService = async (postId, userId) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new Error("Post not found");
  }

  post.likes = post.likes.filter((id) => id.toString() !== userId);
  await post.save();
};

export const getPostDetailsService = async (postId, userId) => {
  try {
    // Find post and populate relevant fields
    const post = await Post.findById(postId)
      .populate("userId", "username profilePicture")
      .populate("likes", "username profilePicture");

    if (!post) {
      throw new Error("Post not found");
    }

    // Check if user has saved this post
    const isSaved = await Save.findOne({
      userId,
      contentId: postId,
      contentType: "post",
    });

    // Check if user has liked this post
    const isLiked = post.likes.some((like) => like._id.toString() === userId);

    // Get comment count
    const commentCount = await Comment.countDocuments({
      contentId: postId,
      contentType: "Post",
    });

    // Return post with additional information
    return {
      ...post.toObject(),
      isLiked,
      isSaved: !!isSaved,
      commentCount,
    };
  } catch (error) {
    throw new Error(`Failed to fetch post details: ${error.message}`);
  }
};