// middlewares/upload.js
import multer from "multer";
import path from "path";

// Storage configuration (for local storage, adjust this for your setup)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profile-pics/"); // Folder where images will be stored
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, filename); // Generate a unique filename
  },
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });

// Export middleware to use in routes
export const uploadProfilePic = upload.single("profilePic"); // 'profilePic' is the name of the field in the form
