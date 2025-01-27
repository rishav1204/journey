import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directories exist
const dirs = ["tmp/uploads/images", "tmp/uploads/videos"];
dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.mimetype.startsWith("video/")
      ? "tmp/uploads/videos"
      : "tmp/uploads/images";
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];
  const allowedVideoTypes = ["video/mp4", "video/quicktime", "video/x-msvideo"];

  if (file.fieldname === "video") {
    if (allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid video format. Allowed formats: MP4, MOV, AVI"),
        false
      );
    }
  } else {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid image format. Allowed formats: JPG, PNG, GIF"),
        false
      );
    }
  }
};

const limits = {
  video: {
    fileSize: 100 * 1024 * 1024, // 100MB for videos
    files: 1,
  },
  image: {
    fileSize: 5 * 1024 * 1024, // 5MB for images
    files: 10,
  },
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // Max file size
    files: 10, // Max number of files
  },
});

// Specific upload middlewares
export const uploadVideo = multer({
  storage,
  fileFilter,
  limits: limits.video,
}).single("video");

export const uploadImages = multer({
  storage,
  fileFilter,
  limits: limits.image,
}).array("media", 10);
