import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  type: { type: String, enum: ["image", "video"], required: true },
  width: Number,
  height: Number,
  duration: Number, // For videos
});

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // User who created the post
    },
    content: {
      type: String,
      required: true,
    },
    tags: String,
    media: [mediaSchema],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;

