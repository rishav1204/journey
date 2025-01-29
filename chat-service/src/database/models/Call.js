import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["voice", "video", "conference"],
      required: true,
    },
    initiator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["host", "cohost", "participant"],
          default: "participant",
        },
        joinedAt: Date,
        leftAt: Date,
        status: {
          type: String,
          enum: [
            "invited",
            "ringing",
            "accepted",
            "declined",
            "missed",
            "removed",
          ],
          default: "invited",
        },
        deviceInfo: {
          deviceId: String,
          platform: String,
          browser: String,
          version: String,
          networkType: String,
        },
        permissions: {
          canSpeak: { type: Boolean, default: true },
          canVideo: { type: Boolean, default: true },
          canShare: { type: Boolean, default: false },
        },
      },
    ],
    timing: {
      scheduledFor: Date,
      startTime: Date,
      endTime: Date,
      duration: Number,
      timeZone: String,
    },
    status: {
      type: String,
      enum: ["scheduled", "connecting", "ongoing", "ended", "missed", "failed"],
      default: "connecting",
    },
    callDetails: {
      quality: {
        type: String,
        enum: ["low", "medium", "high", "auto"],
        default: "auto",
      },
      screenSharing: {
        isActive: Boolean,
        sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        startTime: Date,
        resolution: String,
      },
      recording: {
        enabled: Boolean,
        startedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        startTime: Date,
        duration: Number,
        format: String,
        url: String,
        size: Number,
        status: {
          type: String,
          enum: ["recording", "processing", "completed", "failed"],
          default: "recording",
        },
      },
    },
    mediaConfig: {
      resolution: String,
      frameRate: Number,
      bitrate: Number,
      codec: String,
      audioConfig: {
        echoCancellation: { type: Boolean, default: true },
        noiseSuppression: { type: Boolean, default: true },
        sampleRate: Number,
      },
      videoConfig: {
        aspectRatio: String,
        maxBitrate: Number,
      },
    },
    networkStats: [
      {
        timestamp: Date,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        bandwidth: Number,
        latency: Number,
        packetLoss: Number,
        jitter: Number,
        qualityScore: Number,
      },
    ],
    features: {
      backgroundBlur: Boolean,
      virtualBackground: {
        enabled: Boolean,
        type: String,
        url: String,
      },
      noiseReduction: Boolean,
      captioning: Boolean,
      translation: {
        enabled: Boolean,
        languages: [String],
      },
    },
    groupCall: {
      maxParticipants: { type: Number, default: 8 },
      waitingRoom: { type: Boolean, default: false },
      coHosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      settings: {
        muteOnEntry: { type: Boolean, default: true },
        allowUnmute: { type: Boolean, default: true },
        lockMeeting: { type: Boolean, default: false },
      },
    },
    events: [
      {
        type: {
          type: String,
          enum: [
            "join",
            "leave",
            "mute",
            "unmute",
            "share_start",
            "share_stop",
            "recording",
          ],
        },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: Date,
        metadata: Object,
      },
    ],
    metrics: [{
      timestamp: Date,
      quality: String,
      networkStats: [{
        userId: mongoose.Schema.Types.ObjectId,
        bandwidth: Number,
        latency: Number,
        packetLoss: Number
      }]
    }],
    security: {
      encryption: {
        enabled: Boolean,
        algorithm: String
      }
    }
    metadata: {
      title: String,
      description: String,
      tags: [String],
      scheduledDuration: Number,
      recurring: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
callSchema.index({ initiator: 1, createdAt: -1 });
callSchema.index({ "participants.userId": 1 });
callSchema.index({ status: 1 });
callSchema.index({ "timing.scheduledFor": 1 });

// Validation
callSchema.pre("save", function (next) {
  if (this.timing.endTime && this.timing.startTime) {
    this.timing.duration = (this.timing.endTime - this.timing.startTime) / 1000;
  }
  next();
});

const Call = mongoose.model("Call", callSchema);

export default Call;
