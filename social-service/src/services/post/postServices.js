import Post from "../../models/Post.js";
import {
  uploadPostMedia,
  deleteFromCloudinary,
} from "../../utils/cloudinary.js";
import fs from "fs/promises";

export const createPostService = async (userId, postData) => {
  const { caption, location, tags, media } = postData;
  const uploadedMedia = [];

  try {
    // Upload each media file to Cloudinary
    const mediaPromises = media.map(async (file) => {
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
        // Clean up temp file
        await fs.unlink(file.path);
      } catch (error) {
        throw new Error(
          `Failed to upload ${file.originalname}: ${error.message}`
        );
      }
    });

    await Promise.all(mediaPromises);

    const post = await Post.create({
      userId,
      caption,
      location,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      media: uploadedMedia,
    });

    return await post.populate("userId", "username profilePicture");
  } catch (error) {
    // Clean up any uploaded media if post creation fails
    await Promise.all(
      uploadedMedia.map((m) => deleteFromCloudinary(m.publicId).catch(() => {}))
    );
    throw error;
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
