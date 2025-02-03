// models/Note.js
import mongoose from "mongoose";

// Separate schema for reactions
const reactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["like", "love", "laugh", "sad", "angry"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Separate schema for views
const viewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  viewedAt: {
    type: Date,
    default: Date.now,
  },
  device: String,
  duration: Number, // Time spent viewing in seconds
});

const noteSchema = new mongoose.Schema(
  {
    // Core Fields
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Content
    content: {
      text: {
        type: String,
        required: true,
        maxLength: 1000,
      },
      media: [
        {
          url: String,
          type: {
            type: String,
            enum: ["image", "video", "gif"],
          },
          thumbnail: String,
        },
      ],
      mentions: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      hashtags: [String],
    },

    // Visibility & Access Control
    visibility: {
      type: String,
      enum: ["all", "subscribers", "close_friends", "premium"],
      default: "all",
    },
    accessControl: {
      allowedUsers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      blockedUsers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },

    // Timing & Duration
    timing: {
      publishAt: {
        type: Date,
        default: Date.now,
      },
      expiresAt: Date,
      duration: Number, // How long the note should be visible in hours
    },

    // Interaction Tracking
    interactions: {
      reactions: [reactionSchema],
      views: [viewSchema],
      shareCount: {
        type: Number,
        default: 0,
      },
      replyCount: {
        type: Number,
        default: 0,
      },
    },

    // Display & Formatting
    display: {
      isHighlighted: {
        type: Boolean,
        default: false,
      },
      isPinned: {
        type: Boolean,
        default: false,
      },
      style: {
        backgroundColor: String,
        textColor: String,
        font: String,
      },
    },

    // Status
    status: {
      type: String,
      enum: ["draft", "published", "archived", "expired"],
      default: "published",
    },

    // Metadata
    metadata: {
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number],
          default: [0, 0],
        },
      },
      device: String,
      language: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
noteSchema.index({ channelId: 1, createdAt: -1 });
noteSchema.index({ createdBy: 1, createdAt: -1 });
noteSchema.index({ "content.hashtags": 1 });
noteSchema.index({ "timing.expiresAt": 1 });
noteSchema.index({ status: 1 });
noteSchema.index({
  "content.text": "text",
  "content.hashtags": "text",
});

// Geo index for location-based queries
noteSchema.index({ "metadata.location": "2dsphere" });

// Methods
noteSchema.methods.isExpired = function () {
  return this.timing.expiresAt && this.timing.expiresAt < new Date();
};

noteSchema.methods.isViewedBy = function (userId) {
  return this.interactions.views.some((view) => view.userId.equals(userId));
};

noteSchema.methods.addView = async function (userId) {
  if (!this.isViewedBy(userId)) {
    this.interactions.views.push({ userId });
    await this.save();
  }
};

// Pre-save middleware
noteSchema.pre("save", function (next) {
  if (this.timing.duration && !this.timing.expiresAt) {
    this.timing.expiresAt = new Date(
      Date.now() + this.timing.duration * 60 * 60 * 1000
    );
  }
  next();
});

const Note = mongoose.model("Note", noteSchema);

export default Note;
