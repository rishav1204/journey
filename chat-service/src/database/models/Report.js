import mongoose from "mongoose";

const evidenceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["screenshot", "audio", "video", "text", "link"],
    required: true,
  },
  url: String,
  content: String,
  metadata: {
    timestamp: Date,
    size: Number,
    mimeType: String,
    hash: String,
  },
  verified: { type: Boolean, default: false },
});

const reportSchema = new mongoose.Schema(
  {
    // Report Context
    context: {
      reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },
      reportedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },
      messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
      conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
      },
      groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
    },

    // Report Details
    details: {
      category: {
        type: String,
        enum: [
          "spam",
          "harassment",
          "hate_speech",
          "inappropriate_content",
          "violence",
          "copyright",
          "impersonation",
          "other",
        ],
        required: true,
      },
      subcategory: String,
      description: {
        type: String,
        maxlength: 1000,
      },
      severity: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "medium",
      },
      evidence: [evidenceSchema],
    },

    // Moderation
    moderation: {
      status: {
        type: String,
        enum: ["pending", "under_review", "resolved", "rejected", "appealed"],
        default: "pending",
      },
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      actions: [
        {
          type: {
            type: String,
            enum: [
              "warning",
              "mute",
              "temporary_ban",
              "permanent_ban",
              "content_removal",
            ],
          },
          appliedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          appliedAt: Date,
          duration: Number,
          reason: String,
        },
      ],
      notes: [
        {
          content: String,
          addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          addedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },

    // Appeal Process
    appeal: {
      status: {
        type: String,
        enum: ["none", "submitted", "under_review", "accepted", "rejected"],
      },
      submittedAt: Date,
      reason: String,
      evidence: [evidenceSchema],
      resolvedAt: Date,
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },

    // Analytics
    metrics: {
      similarReports: Number,
      timeToResolve: Number,
      userHistoryCount: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
reportSchema.index({ "moderation.status": 1, createdAt: -1 });
reportSchema.index({ "details.category": 1 });
reportSchema.index({ "details.severity": 1 });
reportSchema.index({
  "context.reportedBy": 1,
  "context.reportedUser": 1,
});

const Report = mongoose.model("Report", reportSchema);

export default Report;
