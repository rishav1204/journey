import mongoose from "mongoose";

const shareSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // The user who shared the content
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    contentType: {
      type: String,
      enum: ["post", "reel"],
      required: true,
    },
    sharedTo: {
      type: mongoose.Schema.Types.ObjectId, // Changed to ObjectId for user reference
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    sharedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Share = mongoose.model("Share", shareSchema);

export default Share;
