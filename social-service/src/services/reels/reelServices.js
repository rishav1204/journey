import { promises as fs } from "fs";
import mongoose from "mongoose";
import Reel from "../../models/Reel.js";
import User from "../../models/User.js";
import Comment from "../../models/Comment.js";
import Like from "../../models/Like.js";
import Save from "../../models/Save.js";
import {
  uploadReel,
  deleteFromCloudinary,
} from "../../utils/cloudinary.js";

export const createReelService = async (userId, reelData) => {
  const { description, tags, video } = reelData;
  const session = await mongoose.startSession();
  let hasCommitted = false;

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    session.startTransaction();

    // Process tags: Split by spaces and ensure each tag starts with #
    const processedTags = tags
      ? tags
          .split(/[\s,]+/)
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
          .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
      : [];

    // Upload video to Cloudinary
    const uploadedVideo = await uploadReel(video);
    await fs.unlink(video.path);

    const reel = await Reel.create(
      [
        {
          userId,
          videoUrl: uploadedVideo.url,
          description,
          tags: processedTags.join(" "), // Join tags with space as per Reel model
          publicId: uploadedVideo.publicId,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    hasCommitted = true;

    return await reel[0].populate("userId", "username profilePicture");
  } catch (error) {
    if (!hasCommitted) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    session.endSession();
  }
};

export const deleteReelService = async (reelId, userId) => {
  const reel = await Reel.findOne({ _id: reelId, userId });

  if (!reel) {
    throw new Error("Reel not found or unauthorized");
  }

  try {
    // Delete video from Cloudinary
    await deleteFromCloudinary(reel.publicId);
    await reel.deleteOne();
  } catch (error) {
    throw new Error(`Failed to delete reel: ${error.message}`);
  }
};

export const getReelDetailsService = async (reelId, userId) => {
  try {
    const reel = await Reel.findById(reelId).populate(
      "userId",
      "username profilePicture"
    );

    if (!reel) {
      throw new Error("Reel not found");
    }

    // Get user interactions
    const [isLiked, isSaved] = await Promise.all([
      Like.exists({
        userId,
        contentId: reelId,
        contentType: "reel",
      }),
      Save.exists({
        userId,
        contentId: reelId,
        contentType: "reel",
      }),
    ]);

    // Get latest comments
    const comments = await Comment.find({
      contentId: reelId,
      contentType: "reel",
    })
      .populate("userId", "username profilePicture")
      .sort({ createdAt: -1 })
      .limit(3);

    return {
      ...reel.toObject(),
      isLiked: !!isLiked,
      isSaved: !!isSaved,
      recentComments: comments,
    };
  } catch (error) {
    throw new Error(`Failed to fetch reel details: ${error.message}`);
  }
};

export const likeReelService = async (reelId, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if reel exists
    const reel = await Reel.findById(reelId).session(session);
    if (!reel) {
      throw new Error("Reel not found");
    }

    // Check if already liked
    const existingLike = await Like.findOne({
      contentId: reelId,
      userId,
      contentType: "reel",
    }).session(session);

    if (existingLike) {
      throw new Error("Reel already liked");
    }

    // Create like document
    await Like.create(
      [
        {
          contentId: reelId,
          userId,
          contentType: "reel",
        },
      ],
      { session }
    );

    // Update reel like count
    await Reel.findByIdAndUpdate(reelId, {
      $inc: { likesCount: 1 },
    }).session(session);

    await session.commitTransaction();

    // Return updated reel with populated fields
    return await Reel.findById(reelId).populate(
      "userId",
      "username profilePicture"
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};


export const unlikeReelService = async (reelId, userId) => {
  try {
    const like = await Like.findOne({
      contentId: reelId,
      userId,
      contentType: "reel",
    });

    if (!like) {
      throw new Error("Reel not liked yet");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Remove like document
      await Like.findByIdAndDelete(like._id).session(session);

      // Decrease like count in reel
      await Reel.findByIdAndUpdate(reelId, {
        $inc: { likesCount: -1 },
      }).session(session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    throw new Error(`Unlike failed: ${error.message}`);
  }
};
