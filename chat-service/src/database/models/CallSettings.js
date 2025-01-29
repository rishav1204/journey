import mongoose from "mongoose";

const callSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    generalSettings: {
      defaultCallType: {
        type: String,
        enum: ["voice", "video"],
        default: "voice",
      },
      autoAnswer: {
        enabled: Boolean,
        forContacts: Boolean,
        delay: Number,
      },
      endCallBehavior: {
        autoLeaveAfter: Number, // minutes
        confirmBeforeLeaving: Boolean,
      },
    },
    audioSettings: {
      inputDevice: {
        deviceId: String,
        label: String,
        isDefault: Boolean,
      },
      outputDevice: {
        deviceId: String,
        label: String,
        isDefault: Boolean,
      },
      defaultMuted: { type: Boolean, default: false },
      noiseReduction: { type: Boolean, default: true },
      echoCancellation: { type: Boolean, default: true },
      autoGainControl: { type: Boolean, default: true },
      volume: {
        input: { type: Number, min: 0, max: 100, default: 100 },
        output: { type: Number, min: 0, max: 100, default: 100 },
      },
    },
    videoSettings: {
      device: {
        deviceId: String,
        label: String,
        isDefault: Boolean,
      },
      defaultVideoOff: { type: Boolean, default: false },
      quality: {
        preferred: {
          type: String,
          enum: ["low", "medium", "high", "auto"],
          default: "auto",
        },
        maxBitrate: Number,
        frameRate: { type: Number, default: 30 },
      },
      background: {
        type: {
          type: String,
          enum: ["none", "blur", "virtual"],
          default: "none",
        },
        blurStrength: Number,
        virtualBackgroundUrl: String,
      },
    },
    privacy: {
      allowCallsFrom: {
        type: String,
        enum: ["everyone", "contacts", "nobody"],
        default: "everyone",
      },
      blockList: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          blockedAt: Date,
          reason: String,
        },
      ],
      showStatus: { type: Boolean, default: true },
      recordingConsent: { type: Boolean, default: false },
    },
    notifications: {
      missedCalls: { type: Boolean, default: true },
      callReminders: { type: Boolean, default: true },
      ringtonePath: String,
      vibration: { type: Boolean, default: true },
      channels: {
        inApp: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        email: { type: Boolean, default: false },
      },
    },
    scheduling: {
      quietHours: [
        {
          start: String,
          end: String,
          days: [Number],
          action: {
            type: String,
            enum: ["reject", "silent", "auto_message"],
            default: "silent",
          },
        },
      ],
      autoRejectMessage: String,
    },
    accessibility: {
      closedCaptions: { type: Boolean, default: false },
      highContrast: { type: Boolean, default: false },
      textSize: {
        type: String,
        enum: ["small", "medium", "large"],
        default: "medium",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
callSettingsSchema.index({ userId: 1 });
callSettingsSchema.index({ "privacy.allowCallsFrom": 1 });
callSettingsSchema.index({ "privacy.blockList.userId": 1 });

// Validation
callSettingsSchema.pre("save", function (next) {
  if (this.scheduling.quietHours) {
    for (const schedule of this.scheduling.quietHours) {
      if (!schedule.start || !schedule.end) {
        next(new Error("Quiet hours must have start and end times"));
      }
    }
  }
  next();
});

const CallSettings = mongoose.model("CallSettings", callSettingsSchema);

export default CallSettings;
