// src/middlewares/uploadMiddleware.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directory exists
if (!fs.existsSync("tmp/uploads")) {
  fs.mkdirSync("tmp/uploads", { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "tmp/uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    video: ["video/mp4", "video/quicktime", "video/webm"],
    document: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    audio: ["audio/mpeg", "audio/wav", "audio/ogg"],
  };

  const fileType = file.mimetype.split("/")[0];

  if (allowedTypes[fileType]?.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types: ${Object.keys(allowedTypes).join(
          ", "
        )}`
      ),
      false
    );
  }
};

const limits = {
  fileSize: 100 * 1024 * 1024, // 100MB max file size
  files: 10, // Maximum 10 files per upload
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits,
});
