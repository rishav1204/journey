import mongoose from "mongoose";

const searchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  query: {
    text: String,
    type: {
      type: String,
      enum: ["message", "media", "user", "group", "channel"],
    },
  },
  filters: {
    startDate: Date,
    endDate: Date,
    messageType: String,
    status: String,
  },
  metrics: {
    resultCount: Number,
    responseTime: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "30d", // Auto-delete after 30 days
  },
});

searchHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("SearchHistory", searchHistorySchema);
