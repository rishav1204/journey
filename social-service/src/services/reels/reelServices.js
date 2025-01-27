import { promises as fs } from "fs";
import mongoose from "mongoose";
import Reel from "../../models/Reel.js";
import User from "../../models/User.js";
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
  const reel = await Reel.findById(reelId)
    .populate("userId", "username profilePicture")
    .populate("likes", "username profilePicture");

  if (!reel) {
    throw new Error("Reel not found");
  }

  return reel;
};

export const likeReelService = async (reelId, userId) => {
  const reel = await Reel.findById(reelId);
  if (!reel) {
    throw new Error("Reel not found");
  }

  if (reel.likes && reel.likes.includes(userId)) {
    throw new Error("Reel already liked");
  }

  reel.likes = reel.likes || [];
  reel.likes.push(userId);
  await reel.save();

  return await reel.populate("userId", "username profilePicture");
};

export const unlikeReelService = async (reelId, userId) => {
  const reel = await Reel.findById(reelId);
  if (!reel) {
    throw new Error("Reel not found");
  }

  if (!reel.likes || !reel.likes.includes(userId)) {
    throw new Error("Reel not liked yet");
  }

  reel.likes = reel.likes.filter((id) => id.toString() !== userId.toString());
  await reel.save();
};
