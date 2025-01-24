import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reportedType: {
      type: String,
      enum: ["USER", "POST", "REEL"],
      required: true,
    },
    reportedId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "reportedType",
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "REVIEWED", "RESOLVED", "REJECTED"],
      default: "PENDING",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: Date,
    action: {
      type: String,
      enum: [
        "NO_ACTION",
        "WARNING",
        "TEMPORARY_BAN",
        "PERMANENT_BAN",
        "CONTENT_REMOVED",
      ],
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate reports
reportSchema.index(
  { reportedType: 1, reportedId: 1, reportedBy: 1 },
  { unique: true }
);

const Report = mongoose.model("Report", reportSchema);

export default Report;
