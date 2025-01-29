import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  votes: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      votedAt: {
        type: Date,
        default: Date.now,
      },
      device: String,
      ipAddress: String,
    },
  ],
  metadata: {
    position: Number,
    color: String,
    image: String,
  },
});

const pollSchema = new mongoose.Schema(
  {
    // Context
    context: {
      groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true,
      },
      channelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel",
      },
      messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    },

    // Creator Info
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Poll Content
    content: {
      question: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
      },
      description: String,
      media: {
        type: String,
        url: String,
      },
      options: [optionSchema],
    },

    // Settings
    settings: {
      voting: {
        allowMultipleVotes: { type: Boolean, default: false },
        allowVoteChange: { type: Boolean, default: false },
        maxVotesPerUser: { type: Number, default: 1 },
        minVotesRequired: { type: Number, default: 0 },
      },
      privacy: {
        showVoters: { type: Boolean, default: true },
        anonymous: { type: Boolean, default: false },
        showResults: {
          type: String,
          enum: ["always", "after_vote", "after_end"],
          default: "always",
        },
      },
      timing: {
        duration: Number, // in hours
        startTime: {
          type: Date,
          default: Date.now,
        },
        endTime: Date,
        timezone: String,
      },
      access: {
        restrictedTo: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        requiredRole: String,
      },
    },

    // Status
    status: {
      current: {
        type: String,
        enum: ["draft", "active", "paused", "ended"],
        default: "active",
      },
      history: [
        {
          status: String,
          changedAt: Date,
          changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        },
      ],
    },

    // Results & Analytics
    analytics: {
      totalVotes: { type: Number, default: 0 },
      uniqueVoters: { type: Number, default: 0 },
      results: [
        {
          optionId: mongoose.Schema.Types.ObjectId,
          percentage: Number,
          count: Number,
        },
      ],
      engagement: {
        views: { type: Number, default: 0 },
        shares: { type: Number, default: 0 },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
pollSchema.index({ "context.groupId": 1, createdAt: -1 });
pollSchema.index({ "settings.timing.endTime": 1 });
pollSchema.index({ "status.current": 1 });

// Pre-save middleware
pollSchema.pre("save", function (next) {
  if (this.isModified("content.options")) {
    this.analytics.totalVotes = this.content.options.reduce(
      (sum, option) => sum + option.votes.length,
      0
    );

    const uniqueVoters = new Set();
    this.content.options.forEach((option) =>
      option.votes.forEach((vote) => uniqueVoters.add(vote.userId.toString()))
    );
    this.analytics.uniqueVoters = uniqueVoters.size;
  }
  next();
});

const Poll = mongoose.model("Poll", pollSchema);

export default Poll;
