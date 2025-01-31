// src/controllers/mediaController.js
import {
  uploadMultipleFilesService,
  uploadVideoService,
  uploadDocumentService,
  uploadVoiceNoteService,
  uploadGifService,
  uploadStickerService,
  toggleCompressionService,
  startVoiceRecordingService,
  stopVoiceRecordingService,
  getVoiceNoteInfoService,
  deleteVoiceNoteService,
  generateWaveformService,
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

export const startVoiceRecording = async (req, res) => {
  try {
    const userId = req.user.id;
    const { maxDuration = 300 } = req.body; // 5 minutes default

    const recording = await startVoiceRecordingService({
      userId,
      maxDuration
    });

    res.status(200).json({
      success: true,
      data: recording
    });
  } catch (error) {
    logger.error("Error starting voice recording:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const stopVoiceRecording = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No audio file provided"
      });
    }

    const userId = req.user.id;
    const { recordingId } = req.body;

    const voiceNote = await stopVoiceRecordingService({
      recordingId,
      userId,
      audioFile: req.file
    });

    res.status(200).json({
      success: true,
      data: voiceNote
    });
  } catch (error) {
    logger.error("Error stopping voice recording:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getVoiceNoteInfo = async (req, res) => {
  try {
    const { voiceNoteId } = req.params;
    const userId = req.user.id;

    const voiceNote = await getVoiceNoteInfoService(voiceNoteId, userId);

    res.status(200).json({
      success: true,
      data: voiceNote
    });
  } catch (error) {
    logger.error("Error getting voice note info:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteVoiceNote = async (req, res) => {
  try {
    const { voiceNoteId } = req.params;
    const userId = req.user.id;

    await deleteVoiceNoteService(voiceNoteId, userId);

    res.status(200).json({
      success: true,
      message: "Voice note deleted successfully"
    });
  } catch (error) {
    logger.error("Error deleting voice note:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const generateWaveform = async (req, res) => {
  try {
    const { voiceNoteId } = req.params;
    const userId = req.user.id;

    const waveformData = await generateWaveformService(voiceNoteId, userId);

    res.status(200).json({
      success: true,
      data: waveformData
    });
  } catch (error) {
    logger.error("Error generating waveform:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};