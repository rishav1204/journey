import mongoose from "mongoose";

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
    media: [
      {
        type: String, // Links to images, videos, etc.
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
