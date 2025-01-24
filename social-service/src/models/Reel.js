import mongoose from "mongoose";

const reelSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // User who created the reel
    },
    videoUrl: {
      type: String,
      required: true, // URL of the video
    },
    description: String,
    tags: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Reel = mongoose.model("Reel", reelSchema);

export default Reel;

