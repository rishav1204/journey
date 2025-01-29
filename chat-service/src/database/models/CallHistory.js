import mongoose from "mongoose";

const callHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    calls: [
      {
        callId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Call",
          required: true,
        },
        type: {
          type: String,
          enum: ["incoming", "outgoing", "missed", "conference"],
          required: true,
        },
        participants: [
          {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            role: String,
            duration: Number,
          },
        ],
        callType: {
          type: String,
          enum: ["voice", "video"],
          required: true,
        },
        timestamp: {
          started: Date,
          ended: Date,
        },
        quality: {
          rating: Number,
          issues: [
            {
              type: String,
              timestamp: Date,
              description: String,
            },
          ],
        },
      },
    ],
    statistics: {
      totalCalls: { type: Number, default: 0 },
      missedCalls: { type: Number, default: 0 },
      totalDuration: { type: Number, default: 0 },
      byType: {
        voice: {
          count: { type: Number, default: 0 },
          duration: { type: Number, default: 0 },
        },
        video: {
          count: { type: Number, default: 0 },
          duration: { type: Number, default: 0 },
        },
        conference: {
          count: { type: Number, default: 0 },
          duration: { type: Number, default: 0 },
        },
      },
      frequentContacts: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          callCount: Number,
          totalDuration: Number,
          lastCall: Date,
        },
      ],
    },
    preferences: {
      defaultCallType: {
        type: String,
        enum: ["voice", "video"],
        default: "voice",
      },
      autoReject: {
        enabled: Boolean,
        schedules: [
          {
            start: String,
            end: String,
            days: [Number],
          },
        ],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
callHistorySchema.index({ userId: 1 });
callHistorySchema.index({ "calls.timestamp.started": -1 });
callHistorySchema.index({ "calls.participants.userId": 1 });

// Pre-save hook to update statistics
callHistorySchema.pre("save", function (next) {
  if (this.isModified("calls")) {
    // Update total calls
    this.statistics.totalCalls = this.calls.length;

    // Update missed calls
    this.statistics.missedCalls = this.calls.filter(
      (call) => call.type === "missed"
    ).length;

    // Update total duration
    this.statistics.totalDuration = this.calls.reduce(
      (total, call) => total + (call.duration || 0),
      0
    );

    // Update call type statistics
    const byType = {
      voice: { count: 0, duration: 0 },
      video: { count: 0, duration: 0 },
      conference: { count: 0, duration: 0 },
    };

    this.calls.forEach((call) => {
      if (byType[call.type]) {
        byType[call.type].count++;
        byType[call.type].duration += call.duration || 0;
      }
    });

    this.statistics.byType = byType;
  }
  next();
});

const CallHistory = mongoose.model("CallHistory", callHistorySchema);

export default CallHistory;
