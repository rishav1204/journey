import mongoose from "mongoose";

const messageRequestSchema = new mongoose.Schema(
  {
    // Core Request Info
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Request Content
    content: {
      message: {
        type: String,
        required: true,
        maxlength: 500,
      },
      attachments: [
        {
          type: String,
          enum: ["image", "contact", "location"],
        },
      ],
    },

    // Request Status
    status: {
      current: {
        type: String,
        enum: ["pending", "accepted", "rejected", "expired", "cancelled"],
        default: "pending",
      },
      history: [
        {
          status: String,
          timestamp: Date,
          reason: String,
        },
      ],
      expiresAt: Date,
    },

    // Request Handling
    handling: {
      attempts: { type: Number, default: 1 },
      lastAttempt: Date,
      autoExpire: {
        enabled: { type: Boolean, default: true },
        duration: { type: Number, default: 7 }, // days
      },
    },

    // Security
    security: {
      isSpam: { type: Boolean, default: false },
      trustScore: { type: Number, min: 0, max: 100 },
      verification: {
        isVerified: Boolean,
        method: String,
      },
    },

    // Analytics
    metrics: {
      responseTime: Number,
      deviceInfo: {
        type: String,
        platform: String,
        browser: String,
      },
    },

    // Rate Limiting
    rateLimit: {
      count: { type: Number, default: 1 },
      resetAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
messageRequestSchema.index({
  senderId: 1,
  receiverId: 1,
  "status.current": 1,
});
messageRequestSchema.index(
  { "status.expiresAt": 1 },
  { expireAfterSeconds: 0 }
);

// Pre-save middleware
messageRequestSchema.pre("save", function (next) {
  if (this.isNew && this.status.current === "pending") {
    this.status.expiresAt = new Date(
      Date.now() + this.handling.autoExpire.duration * 24 * 60 * 60 * 1000
    );
  }
  next();
});

const MessageRequest = mongoose.model("MessageRequest", messageRequestSchema);

export default MessageRequest;
