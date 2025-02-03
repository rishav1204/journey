import mongoose from "mongoose";

const scheduledMessageSchema = new mongoose.Schema(
  {
    // Sender & Recipient
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipients: {
      users: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      groups: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Group",
        },
      ],
      channels: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Channel",
        },
      ],
    },

    // Message Content
    content: {
      text: String,
      media: [
        {
          type: {
            type: String,
            enum: ["image", "video", "audio", "document"],
          },
          url: String,
          fileId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Media",
          },
        },
      ],
      metadata: {
        links: [String],
        mentions: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
      },
    },

    // Scheduling
    schedule: {
      scheduledFor: {
        type: Date,
        required: true,
        index: true,
      },
      timezone: {
        type: String,
        default: "UTC",
      },
      recurrence: {
        pattern: {
          type: String,
          enum: ["none", "daily", "weekly", "monthly"],
        },
        interval: Number,
        endDate: Date,
      },
    },

    // Delivery Status
    delivery: {
      status: {
        type: String,
        enum: ["scheduled", "processing", "sent", "cancelled", "failed"],
        default: "scheduled",
      },
      attempts: [
        {
          timestamp: Date,
          status: String,
          error: String,
        },
      ],
      sentMessageIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Message",
        },
      ],
    },

    // Processing
    processing: {
      priority: {
        type: String,
        enum: ["low", "normal", "high"],
        default: "normal",
      },
      retryConfig: {
        maxAttempts: { type: Number, default: 3 },
        backoffDelay: { type: Number, default: 300 }, // seconds
      },
      lastProcessed: Date,
      nextRetry: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
scheduledMessageSchema.index({
  "schedule.scheduledFor": 1,
  "delivery.status": 1,
});
scheduledMessageSchema.index({ "processing.nextRetry": 1 });

// Pre-save middleware
scheduledMessageSchema.pre("save", function (next) {
  if (this.isModified("delivery.status") && this.delivery.status === "failed") {
    const attempts = this.delivery.attempts.length;
    if (attempts < this.processing.retryConfig.maxAttempts) {
      const delay =
        this.processing.retryConfig.backoffDelay * Math.pow(2, attempts);
      this.processing.nextRetry = new Date(Date.now() + delay * 1000);
    }
  }
  next();
});

const ScheduledMessage = mongoose.model(
  "ScheduledMessage",
  scheduledMessageSchema
);

export default ScheduledMessage;
