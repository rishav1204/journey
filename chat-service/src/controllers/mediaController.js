// src/controllers/mediaController.js
import {
  uploadMultipleFilesService,
  uploadVideoService,
  uploadDocumentService,
  uploadVoiceNoteService,
  uploadGifService,
  uploadStickerService,
  toggleCompressionService,
} from "../services/mediaService.js";
import logger from "../utils/logger.js";

export const uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files provided",
      });
    }

    const userId = req.user.id;
    const results = await uploadMultipleFilesService(req.files, userId);

    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${results.length} files`,
      data: results,
    });
  } catch (error) {
    logger.error("Error uploading multiple files:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No video file provided",
      });
    }

    const userId = req.user.id;
    const result = await uploadVideoService(req.file, userId);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("Error uploading video:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No document file provided",
      });
    }

    const userId = req.user.id;
    const result = await uploadDocumentService(req.file, userId);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("Error uploading document:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const uploadVoiceNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No audio file provided",
      });
    }

    const userId = req.user.id;
    const result = await uploadVoiceNoteService(req.file, userId);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("Error uploading voice note:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const uploadGif = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No GIF file provided",
      });
    }

    const userId = req.user.id;
    const result = await uploadGifService(req.file, userId);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("Error uploading GIF:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const uploadSticker = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No sticker file provided",
      });
    }

    const userId = req.user.id;
    const result = await uploadStickerService(req.file, userId);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("Error uploading sticker:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleCompression = async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = req.body;

    const result = await toggleCompressionService(userId, settings);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("Error toggling compression:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
