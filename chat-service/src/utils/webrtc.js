import { io } from "../index.js";
import logger from "./logger.js";
import { validateCallSecurity, encryptCallData } from "./callSecurity.js";
import { trackCallMetrics } from "./callMetrics.js";

export const initializeWebRTC = async (callId) => {
  // Validate call security first
  const securityStatus = await validateCallSecurity(callId);
  if (!securityStatus.isSecure) {
    throw new Error(
      `Call security validation failed: ${securityStatus.reason}`
    );
  }

  const configuration = {
    iceServers: [
      {
        urls: process.env.STUN_SERVER || "stun:stun.l.google.com:19302",
      },
      {
        urls: process.env.TURN_SERVER || "turn:your-turn-server.com:3478",
        username: process.env.TURN_USERNAME || "default_username",
        credential: process.env.TURN_CREDENTIAL || "default_credential",
      },
    ],
    iceCandidatePoolSize: 10,
  };

  const peerConnections = new Map();

  // Start metrics tracking
  const metricsInterval = setInterval(() => {
    trackCallMetrics(callId);
  }, 5000);

  const handleICECandidate = async (userId, candidate) => {
    try {
      await io.to(`call:${callId}`).emit("ice-candidate", {
        userId,
        candidate,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error("ICE candidate error:", error);
    }
  };

  const handleNegotiationNeeded = async (userId) => {
    try {
      const pc = peerConnections.get(userId);
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await pc.setLocalDescription(offer);

      // Encrypt SDP before sending
      const encryptedSdp = await encryptCallData(pc.localDescription, callId);

      io.to(`call:${callId}`).emit("offer", {
        userId,
        sdp: encryptedSdp,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error("Negotiation error:", error);
    }
  };

  const handleTrack = (userId, event) => {
    io.to(`call:${callId}`).emit("track", {
      userId,
      track: event.track,
      streams: event.streams,
    });
  };

  const handleConnectionStateChange = async (userId) => {
    const pc = peerConnections.get(userId);
    if (pc) {
      const stats = await pc.getStats();
      await trackCallMetrics(callId, stats);

      // Handle disconnections
      if (pc.connectionState === "disconnected") {
        logger.warn(`Peer ${userId} disconnected from call ${callId}`);
        io.to(`call:${callId}`).emit("peer-disconnected", { userId });
      }
    }
  };

  return {
    createPeerConnection: (userId) => {
      const pc = new RTCPeerConnection(configuration);
      peerConnections.set(userId, pc);

      // Event handlers
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          handleICECandidate(userId, event.candidate);
        }
      };

      pc.onnegotiationneeded = () => {
        handleNegotiationNeeded(userId);
      };

      pc.ontrack = (event) => {
        handleTrack(userId, event);
      };

      pc.oniceconnectionstatechange = () => {
        handleConnectionStateChange(userId);
      };

      pc.onconnectionstatechange = () => {
        handleConnectionStateChange(userId);
      };

      return pc;
    },

    addTrack: (userId, track, stream) => {
      const pc = peerConnections.get(userId);
      if (pc) {
        pc.addTrack(track, stream);
      }
    },

    removeTrack: (userId, track) => {
      const pc = peerConnections.get(userId);
      if (pc) {
        const sender = pc.getSenders().find((s) => s.track === track);
        if (sender) {
          pc.removeTrack(sender);
        }
      }
    },

    closeConnection: (userId) => {
      const pc = peerConnections.get(userId);
      if (pc) {
        pc.getSenders().forEach((sender) => {
          if (sender.track) {
            sender.track.stop();
          }
        });
        pc.close();
        peerConnections.delete(userId);
      }
    },

    getPeerConnections: () => peerConnections,

    cleanup: () => {
      clearInterval(metricsInterval);
      peerConnections.forEach((pc, userId) => {
        pc.getSenders().forEach((sender) => {
          if (sender.track) {
            sender.track.stop();
          }
        });
        pc.close();
      });
      peerConnections.clear();
      logger.info(`Cleaned up WebRTC resources for call ${callId}`);
    },
  };
};
