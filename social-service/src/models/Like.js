import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // The user who liked the content
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // Can be a reference to Post or Reel
    },
    contentType: {
      type: String,
      enum: ["post", "reel"], // Type of content liked
      required: true,
    },
    likedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Like = mongoose.model("Like", likeSchema);

export default Like;

