// src/utils/callMetrics.js
import Call from "../database/models/Call.js";
import logger from "./logger.js";

const QUALITY_THRESHOLDS = {
  EXCELLENT: { packetLoss: 0.5, latency: 100, jitter: 30 },
  GOOD: { packetLoss: 2, latency: 200, jitter: 50 },
  FAIR: { packetLoss: 5, latency: 300, jitter: 100 }
};

export const trackCallMetrics = async (callId) => {
  try {
    const call = await Call.findById(callId);
    if (!call) {
      throw new Error("Call not found");
    }

    const metrics = {
      timestamp: new Date(),
      networkStats: [],
      quality: "unknown"
    };

    // Collect metrics for each participant
    for (const participant of call.participants) {
      const participantMetrics = await getParticipantMetrics(participant.userId, callId);
      
      metrics.networkStats.push({
        userId: participant.userId,
        ...participantMetrics
      });

      // Update participant's connection quality
      await updateParticipantQuality(call, participant.userId, participantMetrics);
    }

    // Update call quality metrics
    call.metrics.push(metrics);
    await call.save();

    return metrics;
  } catch (error) {
    logger.error("Error tracking call metrics:", error);
    throw error;
  }
};

const getParticipantMetrics = async (userId, callId) => {
  try {
    const stats = {
      bandwidth: 0,
      latency: 0,
      packetLoss: 0,
      jitter: 0,
      resolution: null,
      frameRate: 0,
      audioLevel: 0
    };

    // Collect WebRTC stats
    const peerConnection = getPeerConnection(userId, callId);
    if (peerConnection) {
      const rtcStats = await peerConnection.getStats();
      rtcStats.forEach(stat => {
        if (stat.type === 'inbound-rtp') {
          stats.packetLoss = stat.packetsLost / stat.packetsReceived * 100;
          stats.jitter = stat.jitter * 1000;
        } else if (stat.type === 'candidate-pair' && stat.state === 'succeeded') {
          stats.latency = stat.currentRoundTripTime * 1000;
        }
      });
    }

    return stats;
  } catch (error) {
    logger.error("Error getting participant metrics:", error);
    return null;
  }
};

const calculateQualityScore = (metrics) => {
  if (!metrics) return 0;

  let score = 100;

  // Packet Loss Impact (40%)
  if (metrics.packetLoss > QUALITY_THRESHOLDS.FAIR.packetLoss) score -= 40;
  else if (metrics.packetLoss > QUALITY_THRESHOLDS.GOOD.packetLoss) score -= 20;
  else if (metrics.packetLoss > QUALITY_THRESHOLDS.EXCELLENT.packetLoss) score -= 10;

  // Latency Impact (35%)
  if (metrics.latency > QUALITY_THRESHOLDS.FAIR.latency) score -= 35;
  else if (metrics.latency > QUALITY_THRESHOLDS.GOOD.latency) score -= 17;
  else if (metrics.latency > QUALITY_THRESHOLDS.EXCELLENT.latency) score -= 8;

  // Jitter Impact (25%)
  if (metrics.jitter > QUALITY_THRESHOLDS.FAIR.jitter) score -= 25;
  else if (metrics.jitter > QUALITY_THRESHOLDS.GOOD.jitter) score -= 12;
  else if (metrics.jitter > QUALITY_THRESHOLDS.EXCELLENT.jitter) score -= 6;

  return score;
};

export const generateCallReport = async (callId) => {
  try {
    const call = await Call.findById(callId).populate('participants.userId');
    
    return {
      callId,
      duration: call.timing.duration,
      participantCount: call.participants.length,
      averageQuality: calculateAverageQuality(call.metrics),
      participantMetrics: call.metrics.map(m => ({
        userId: m.userId,
        qualityScore: calculateQualityScore(m),
        networkStats: m.networkStats,
        timestamp: m.timestamp
      })),
      issues: detectQualityIssues(call.metrics)
    };
  } catch (error) {
    logger.error("Error generating call report:", error);
    throw error;
  }
};