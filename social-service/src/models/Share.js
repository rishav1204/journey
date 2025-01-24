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
      required: true, // Can be a reference to Post or Reel
    },
    contentType: {
      type: String,
      enum: ["post", "reel"], // Type of content shared
      required: true,
    },
    sharedTo: {
      type: String,
      enum: ["chat", "feed", "profile", "external"], // Where the content was shared
      required: true,
    },
    sharedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Share = mongoose.model("Share", shareSchema);

export default Share;
