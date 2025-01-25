import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadProfilePicture = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "profile-pictures",
      transformation: [
        { width: 400, height: 400, crop: "fill" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    return {
      publicId: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    throw new Error(`Profile picture upload failed: ${error.message}`);
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    // Check if publicId exists
    if (!publicId) {
      throw new Error("Public ID is required");
    }

    // Delete the resource
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image", // or "video" based on your needs
      invalidate: true, // invalidate CDN cache
    });
    if (result.result !== "ok") {
      throw new Error(`Failed to delete from Cloudinary: ${result.result}`);
    }

    return {
      success: true,
      message: "Resource deleted successfully",
    };
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
  }
};
