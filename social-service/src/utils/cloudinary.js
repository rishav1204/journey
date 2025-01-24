import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Enhanced Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_FORMATS = {
  image: ["jpeg", "png", "jpg", "gif", "webp"],
  video: ["mp4", "mov", "webm"],
};

const validateFile = (file, type) => {
  const format = file.mimetype.split("/")[1];
  if (!ALLOWED_FORMATS[type].includes(format)) {
    throw new Error(
      `Invalid file format. Allowed formats: ${ALLOWED_FORMATS[type].join(
        ", "
      )}`
    );
  }
};

export const uploadPostMedia = async (file) => {
  try {
    const type = file.mimetype.startsWith("image") ? "image" : "video";
    validateFile(file, type);

    const options = {
      resource_type: type,
      folder: "posts",
      quality: "auto",
      fetch_format: "auto",
    };

    if (type === "video") {
      options.chunk_size = 6000000; // 6mb chunks
      options.eager = [
        { width: 720, height: 1280, crop: "fill" },
        { width: 480, height: 854, crop: "fill" },
      ];
    }

    const result = await cloudinary.uploader.upload(file.path, options);
    return {
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      type,
      width: result.width,
      height: result.height,
      duration: result.duration || null,
    };
  } catch (error) {
    console.error("Upload Error:", error);
    throw new Error(
      `Failed to upload ${file.mimetype.split("/")[0]}: ${error.message}`
    );
  }
};

export const uploadReel = async (file) => {
  try {
    validateFile(file, "video");

    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "video",
      folder: "reels",
      eager: [
        { width: 720, height: 1280, crop: "fill" },
        { width: 480, height: 854, crop: "fill" },
      ],
      eager_async: true,
      chunk_size: 6000000,
      transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
    });

    return {
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      duration: result.duration,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error("Reel Upload Error:", error);
    throw new Error(`Failed to upload reel: ${error.message}`);
  }
};

export const uploadProfilePicture = async (file) => {
  try {
    validateFile(file, "image");

    const result = await cloudinary.uploader.upload(file.path, {
      folder: "profiles",
      transformation: [
        { width: 400, height: 400, crop: "fill" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    return {
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
    };
  } catch (error) {
    console.error("Profile Picture Upload Error:", error);
    throw new Error(`Failed to upload profile picture: ${error.message}`);
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    const type = publicId.includes("video") ? "video" : "image";
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: type,
    });
    return result;
  } catch (error) {
    console.error("Delete Error:", error);
    throw new Error(`Failed to delete media: ${error.message}`);
  }
};

// Helper to get optimized URL with transformations
export const getOptimizedUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    quality: "auto",
    fetch_format: "auto",
    ...options,
  });
};
