// src/models/VoiceNote.js
import mongoose from "mongoose";

const voiceNoteSchema = new mongoose.Schema(
  {
    // Core Fields
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["recording", "processing", "completed", "failed"],
      default: "recording",
    },

    // File Details
    url: String,
    duration: Number,
    size: Number,
    format: String,

    // Recording Settings
    settings: {
      sampleRate: Number,
      channels: Number,
      format: String,
      quality: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "high",
      },
    },

    // Audio Processing
    processing: {
      noiseReduction: Boolean,
      normalized: Boolean,
      trimmed: Boolean,
      processedAt: Date,
    },

    // Visualization
    waveform: [Number], // Array of normalized amplitude values

    // Timing
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    maxDuration: {
      type: Number,
      default: 300, // 5 minutes in seconds
    },

    // Metadata
    metadata: {
      deviceInfo: {
        type: String,
        platform: String,
        browser: String,
      },
      transcription: String,
      language: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
voiceNoteSchema.index({ userId: 1, createdAt: -1 });
voiceNoteSchema.index({ status: 1 });

// Pre-save middleware
voiceNoteSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "completed") {
    this.completedAt = new Date();
  }
  next();
});

const VoiceNote = mongoose.model("VoiceNote", voiceNoteSchema);

export default VoiceNote;
