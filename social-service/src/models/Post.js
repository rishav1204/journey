import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  type: { type: String, enum: ["image", "video"], required: true },
  width: Number,
  height: Number,
  duration: Number,
});

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    caption: {
      type: String,
      required: true,
    },
    location: String,
    tags: [String],
    media: [mediaSchema],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    shares: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
