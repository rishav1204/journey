// src/services/mediaService.js
import { uploadToCloud, deleteFromCloud } from "../utils/cloudStorage.js";
import Media from "../database/models/Media.js";
import MediaSettings from "../database/models/MediaSettings.js";
import fs from "fs/promises";
import logger from "../utils/logger.js";

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
