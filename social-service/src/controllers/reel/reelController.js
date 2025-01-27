import { promises as fs } from "fs";
import {
  createReelService,
  deleteReelService,
  getReelDetailsService,
  likeReelService,
  unlikeReelService,
} from "../../services/reel/reelServices.js";
import mongoose from "mongoose";

export const createReel = async (req, res) => {
  try {
    const { description, tags } = req.body;
    const video = req.file;
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const reel = await createReelService(userId, {
      description,
      tags,
      video,
    });

    res.status(201).json({
      success: true,
      message: "Reel created successfully",
      data: reel,
    });
  } catch (error) {
    // Clean up uploaded file if there's an error
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({
      success: false,
      message: "Error creating reel",
      error: error.message,
    });
  }
};

export const getReelDetails = async (req, res) => {
  try {
    const { reelId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(reelId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reelId format",
      });
    }

    const reel = await getReelDetailsService(reelId, userId);

    res.status(200).json({
      success: true,
      data: reel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching reel details",
      error: error.message,
    });
  }
};

export const deleteReel = async (req, res) => {
  try {
    const { reelId } = req.params;
    const userId = req.user.id;

    await deleteReelService(reelId, userId);

    res.status(200).json({
      success: true,
      message: "Reel deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting reel",
      error: error.message,
    });
  }
};

export const likeReel = async (req, res) => {
  try {
    const { reelId } = req.params;
    const userId = req.user.id;

    const reel = await likeReelService(reelId, userId);

    res.status(200).json({
      success: true,
      message: "Reel liked successfully",
      data: reel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error liking reel",
      error: error.message,
    });
  }
};

export const unlikeReel = async (req, res) => {
  try {
    const { reelId } = req.params;
    const userId = req.user.id;

    await unlikeReelService(reelId, userId);

    res.status(200).json({
      success: true,
      message: "Reel unliked successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error unliking reel",
      error: error.message,
    });
  }
};
