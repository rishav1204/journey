import mongoose from "mongoose";

const reelSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    description: String,
    tags: [String],
    publicId: String,
    isPrivate: {
      type: Boolean,
      default: false,
    },
    // These will be counts, actual relations stored in respective models
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    sharesCount: {
      type: Number,
      default: 0,
    },
    savesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Reel = mongoose.model("Reel", reelSchema);
export default Reel;
