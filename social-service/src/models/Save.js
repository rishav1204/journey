import mongoose from "mongoose";

const saveSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // The user who saved the content
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // Can be a reference to Post or Reel
    },
    contentType: {
      type: String,
      enum: ["post", "reel"], // Type of content saved
      required: true,
    },
    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Save = mongoose.model("Save", saveSchema);

export default Save;

