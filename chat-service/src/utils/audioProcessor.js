// src/utils/audioProcessor.js
import ffmpeg from "fluent-ffmpeg";
import { Readable } from "stream";
import { createWorker } from "mediasoup";
import logger from "./logger.js";

export const processAudio = async (audioBuffer, options = {}) => {
  const {
    normalize = true,
    removeNoise = true,
    trim = true,
    format = "mp3",
    sampleRate = 44100,
    channels = 1,
    quality = "high",
  } = options;

  try {
    // Convert buffer to stream
    const inputStream = new Readable();
    inputStream.push(audioBuffer);
    inputStream.push(null);

    return new Promise((resolve, reject) => {
      let command = ffmpeg(inputStream)
        .toFormat(format)
        .audioFrequency(sampleRate)
        .audioChannels(channels);

      // Quality settings
      const qualitySettings = {
        low: { bitrate: "64k", compression: 9 },
        medium: { bitrate: "128k", compression: 6 },
        high: { bitrate: "192k", compression: 3 },
      };

      command = command.audioBitrate(qualitySettings[quality].bitrate);

      // Audio processing filters
      let filters = [];

      if (normalize) {
        filters.push("dynaudnorm"); // Dynamic audio normalization
      }

      if (removeNoise) {
        filters.push("anlmdn"); // Noise reduction
        filters.push("highpass=f=200"); // Remove low frequency noise
        filters.push("lowpass=f=3000"); // Remove high frequency noise
      }

      if (trim) {
        filters.push("silenceremove=1:0:-50dB"); // Remove silence from start
        filters.push("areverse,silenceremove=1:0:-50dB,areverse"); // Remove silence from end
      }

      if (filters.length > 0) {
        command = command.audioFilters(filters);
      }

      // Process audio
      const chunks = [];
      command
        .on("error", (err) => {
          logger.error("Error processing audio:", err);
          reject(err);
        })
        .on("end", () => {
          const processedBuffer = Buffer.concat(chunks);
          resolve(processedBuffer);
        })
        .on("data", (chunk) => {
          chunks.push(chunk);
        })
        .pipe();
    });
  } catch (error) {
    logger.error("Error in processAudio:", error);
    throw error;
  }
};

export const generateWaveform = async (audioBuffer, segments = 100) => {
  try {
    // Create audio context
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    // Decode audio data
    const audioData = await audioContext.decodeAudioData(audioBuffer);
    const channelData = audioData.getChannelData(0);

    // Calculate segment size
    const segmentSize = Math.floor(channelData.length / segments);

    // Generate waveform data
    const waveform = [];
    for (let i = 0; i < segments; i++) {
      const start = i * segmentSize;
      const end = start + segmentSize;
      const segment = channelData.slice(start, end);

      // Calculate average amplitude for segment
      const amplitude =
        segment.reduce((sum, value) => sum + Math.abs(value), 0) / segmentSize;
      waveform.push(amplitude);
    }

    // Normalize waveform values between 0 and 1
    const maxAmplitude = Math.max(...waveform);
    const normalizedWaveform = waveform.map((amp) => amp / maxAmplitude);

    return normalizedWaveform;
  } catch (error) {
    logger.error("Error generating waveform:", error);
    throw error;
  }
};

// Helper functions for audio analysis
export const analyzeAudio = async (audioBuffer) => {
  try {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createBufferSource();

    source.buffer = await audioContext.decodeAudioData(audioBuffer);
    source.connect(analyser);

    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(frequencyData);

    return {
      duration: source.buffer.duration,
      sampleRate: source.buffer.sampleRate,
      numberOfChannels: source.buffer.numberOfChannels,
      frequencyData: Array.from(frequencyData),
    };
  } catch (error) {
    logger.error("Error analyzing audio:", error);
    throw error;
  }
};
