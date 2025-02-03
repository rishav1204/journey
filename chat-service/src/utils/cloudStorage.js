import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { promisify } from "util";
import { ValidationError } from "./errors.js";
import logger from "./logger.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_RETRIES = 3;
const ALLOWED_TYPES = ["video/mp4", "video/webm", "audio/mp3", "audio/wav"];
const FOLDER_NAME = "chat-recordings";

export const uploadToCloud = async (filePath, contentType = "video/mp4") => {
  try {
    if (!ALLOWED_TYPES.includes(contentType)) {
      throw new ValidationError("Invalid file type");
    }

    let attempt = 0;
    while (attempt < MAX_RETRIES) {
      try {
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          resource_type: contentType.startsWith("video") ? "video" : "raw",
          folder: FOLDER_NAME,
          use_filename: true,
          unique_filename: true,
        });

        logger.info("File uploaded successfully", {
          publicId: uploadResult.public_id,
        });

        return uploadResult.secure_url;
      } catch (error) {
        attempt++;
        if (attempt === MAX_RETRIES) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  } catch (error) {
    logger.error("Upload failed:", error);
    throw new Error(`Upload failed: ${error.message}`);
  } finally {
    // Cleanup temporary file
    try {
      await promisify(fs.unlink)(filePath);
    } catch (error) {
      logger.warn("Failed to cleanup temp file:", error);
    }
  }
};

export const deleteFromCloud = async (fileUrl) => {
  try {
    const publicId = fileUrl.split("/").slice(-2).join("/").split(".")[0];

    let attempt = 0;
    while (attempt < MAX_RETRIES) {
      try {
        const result = await cloudinary.uploader.destroy(publicId, {
          resource_type: "video",
        });

        if (result.result === "ok") {
          logger.info("File deleted successfully", { publicId });
          return true;
        }
        throw new Error("Delete failed");
      } catch (error) {
        attempt++;
        if (attempt === MAX_RETRIES) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  } catch (error) {
    logger.error("Delete failed:", error);
    throw new Error(`Delete failed: ${error.message}`);
  }
};
