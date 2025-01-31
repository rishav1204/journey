// src/services/mediaService.js
import { uploadToCloud, deleteFromCloud } from "../utils/cloudStorage.js";
import Media from "../database/models/Media.js";
import MediaSettings from "../database/models/MediaSettings.js";
import VoiceNote from "../models/VoiceNote.js";
import fs from "fs/promises";
import logger from "../utils/logger.js";
import { processAudio } from "../utils/audioProcessor.js";
import { NotFoundError } from "../utils/errors.js";

export const uploadMultipleFilesService = async (files, userId) => {
  const results = [];
  const settings = await MediaSettings.findOne({ userId });

  for (const file of files) {
    try {
      const fileType = file.mimetype.split("/")[0];
      let result;

      switch (fileType) {
        case "image":
          result = await uploadImageService(file, userId, settings);
          break;
        case "video":
          result = await uploadVideoService(file, userId, settings);
          break;
        case "audio":
          result = await uploadVoiceNoteService(file, userId);
          break;
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }

      results.push(result);
    } catch (error) {
      logger.error(`Error processing file ${file.originalname}:`, error);
      throw error;
    } finally {
      // Clean up temporary file
      try {
        await fs.unlink(file.path);
      } catch (error) {
        logger.error(`Error deleting temporary file ${file.path}:`, error);
      }
    }
  }

  return results;
};

export const uploadVideoService = async (file, userId, settings = null) => {
  try {
    if (!settings) {
      settings = await MediaSettings.findOne({ userId });
    }

    const uploadResult = await uploadToCloud(file.path, {
      folder: "chat/videos",
      resource_type: "video",
      quality: settings?.compression?.video?.quality || "auto",
      eager: [
        { width: 720, height: 1280, crop: "fill" },
        { width: 480, height: 854, crop: "fill" },
      ],
    });

    const media = await Media.create({
      senderId: userId,
      mediaType: "video",
      file: {
        originalName: file.originalname,
        fileName: file.filename,
        fileSize: file.size,
        mimeType: file.mimetype,
      },
      urls: {
        original: uploadResult.secure_url,
        optimized: uploadResult.eager[0].secure_url,
      },
      storage: {
        provider: "cloudinary",
        publicId: uploadResult.public_id,
      },
    });

    return media;
  } catch (error) {
    logger.error("Error in uploadVideoService:", error);
    throw error;
  } finally {
    await fs.unlink(file.path);
  }
};

export const uploadDocumentService = async (file, userId) => {
  try {
    const uploadResult = await uploadToCloud(file.path, {
      folder: "chat/documents",
      resource_type: "raw",
    });

    const media = await Media.create({
      senderId: userId,
      mediaType: "document",
      file: {
        originalName: file.originalname,
        fileName: file.filename,
        fileSize: file.size,
        mimeType: file.mimetype,
      },
      urls: {
        original: uploadResult.secure_url,
      },
      storage: {
        provider: "cloudinary",
        publicId: uploadResult.public_id,
      },
    });

    return media;
  } catch (error) {
    logger.error("Error in uploadDocumentService:", error);
    throw error;
  } finally {
    await fs.unlink(file.path);
  }
};

export const uploadVoiceNoteService = async (file, userId) => {
  try {
    const uploadResult = await uploadToCloud(file.path, {
      folder: "chat/voice-notes",
      resource_type: "video",
    });

    const media = await Media.create({
      senderId: userId,
      mediaType: "audio",
      file: {
        originalName: file.originalname,
        fileName: file.filename,
        fileSize: file.size,
        mimeType: file.mimetype,
      },
      urls: {
        original: uploadResult.secure_url,
      },
      storage: {
        provider: "cloudinary",
        publicId: uploadResult.public_id,
      },
    });

    return media;
  } catch (error) {
    logger.error("Error in uploadVoiceNoteService:", error);
    throw error;
  } finally {
    await fs.unlink(file.path);
  }
};

export const uploadGifService = async (file, userId) => {
  try {
    const uploadResult = await uploadToCloud(file.path, {
      folder: "chat/gifs",
      resource_type: "image",
    });

    const media = await Media.create({
      senderId: userId,
      mediaType: "gif",
      file: {
        originalName: file.originalname,
        fileName: file.filename,
        fileSize: file.size,
        mimeType: file.mimetype,
      },
      urls: {
        original: uploadResult.secure_url,
      },
      storage: {
        provider: "cloudinary",
        publicId: uploadResult.public_id,
      },
    });

    return media;
  } catch (error) {
    logger.error("Error in uploadGifService:", error);
    throw error;
  } finally {
    await fs.unlink(file.path);
  }
};

export const uploadStickerService = async (file, userId) => {
  try {
    const uploadResult = await uploadToCloud(file.path, {
      folder: "chat/stickers",
      resource_type: "image",
    });

    const media = await Media.create({
      senderId: userId,
      mediaType: "sticker",
      file: {
        originalName: file.originalname,
        fileName: file.filename,
        fileSize: file.size,
        mimeType: file.mimetype,
      },
      urls: {
        original: uploadResult.secure_url,
      },
      storage: {
        provider: "cloudinary",
        publicId: uploadResult.public_id,
      },
    });

    return media;
  } catch (error) {
    logger.error("Error in uploadStickerService:", error);
    throw error;
  } finally {
    await fs.unlink(file.path);
  }
};

export const toggleCompressionService = async (userId, settings) => {
  try {
    const mediaSettings = await MediaSettings.findOneAndUpdate(
      { userId },
      { compression: settings },
      { new: true, upsert: true }
    );
    return mediaSettings;
  } catch (error) {
    logger.error("Error in toggleCompressionService:", error);
    throw error;
  }
};

export const startVoiceRecordingService = async ({ userId, maxDuration = 300 }) => {
  try {
    const voiceNote = await VoiceNote.create({
      userId,
      status: 'recording',
      maxDuration,
      startedAt: new Date(),
      settings: {
        sampleRate: 44100,
        channels: 1,
        format: 'mp3',
        quality: 'high'
      }
    });

    return voiceNote;
  } catch (error) {
    logger.error('Error in startVoiceRecordingService:', error);
    throw error;
  }
};

export const stopVoiceRecordingService = async ({ userId, recordingId, audioFile }) => {
  try {
    const recording = await VoiceNote.findOne({ 
      _id: recordingId,
      userId,
      status: 'recording'
    });

    if (!recording) {
      throw new NotFoundError('Recording session not found');
    }

    // Process audio file
    const processedAudio = await processAudio(audioFile.buffer, {
      normalize: true,
      removeNoise: true,
      trim: true
    });

    // Upload to cloud storage
    const uploadedFile = await uploadToCloud(processedAudio, {
      folder: 'voice-notes',
      resource_type: 'video',
      format: 'mp3'
    });

    // Update recording with file info
    recording.status = 'completed';
    recording.duration = processedAudio.duration;
    recording.url = uploadedFile.secure_url;
    recording.size = uploadedFile.bytes;
    recording.format = uploadedFile.format;
    recording.waveform = await generateWaveform(processedAudio);
    await recording.save();

    return recording;
  } catch (error) {
    logger.error('Error in stopVoiceRecordingService:', error);
    throw error;
  }
};

export const getVoiceNoteInfoService = async (voiceNoteId, userId) => {
  try {
    const voiceNote = await VoiceNote.findOne({
      _id: voiceNoteId,
      userId
    });

    if (!voiceNote) {
      throw new NotFoundError('Voice note not found');
    }

    return {
      id: voiceNote._id,
      duration: voiceNote.duration,
      url: voiceNote.url,
      waveform: voiceNote.waveform,
      createdAt: voiceNote.createdAt,
      size: voiceNote.size,
      format: voiceNote.format
    };
  } catch (error) {
    logger.error('Error in getVoiceNoteInfoService:', error);
    throw error;
  }
};

export const deleteVoiceNoteService = async (voiceNoteId, userId) => {
  try {
    const voiceNote = await VoiceNote.findOne({
      _id: voiceNoteId,
      userId
    });

    if (!voiceNote) {
      throw new NotFoundError('Voice note not found');
    }

    // Delete from cloud storage if URL exists
    if (voiceNote.url) {
      await deleteFromCloud(voiceNote.url);
    }

    await voiceNote.deleteOne();
  } catch (error) {
    logger.error('Error in deleteVoiceNoteService:', error);
    throw error;
  }
};

export const generateWaveformService = async (voiceNoteId, userId) => {
  try {
    const voiceNote = await VoiceNote.findOne({
      _id: voiceNoteId,
      userId
    });

    if (!voiceNote) {
      throw new NotFoundError('Voice note not found');
    }

    // If waveform already exists, return it
    if (voiceNote.waveform) {
      return voiceNote.waveform;
    }

    // Generate waveform if it doesn't exist
    const waveform = await generateWaveform(voiceNote.url);
    
    // Update voice note with new waveform
    voiceNote.waveform = waveform;
    await voiceNote.save();

    return waveform;
  } catch (error) {
    logger.error('Error in generateWaveformService:', error);
    throw error;
  }
};

// Helper function to generate waveform data
const generateWaveform = async (audioBuffer) => {
  try {
    // Implementation depends on audio processing library
    // Example using Web Audio API or node-audio-peaks
    const peaks = await extractPeaks(audioBuffer);
    return normalizeWaveform(peaks);
  } catch (error) {
    logger.error('Error generating waveform:', error);
    throw error;
  }
};

// Helper function to normalize waveform data
const normalizeWaveform = (peaks, segments = 100) => {
  // Normalize peaks to values between 0 and 1
  // and reduce to specified number of segments
  const normalized = peaks.map(peak => Math.min(Math.abs(peak), 1));
  const segmentSize = Math.floor(normalized.length / segments);
  
  return Array.from({ length: segments }, (_, i) => {
    const start = i * segmentSize;
    const end = start + segmentSize;
    const segment = normalized.slice(start, end);
    return segment.reduce((sum, val) => sum + val, 0) / segment.length;
  });
};