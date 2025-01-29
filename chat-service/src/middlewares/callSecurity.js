// src/utils/callSecurity.js
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Call from "../database/models/Call.js";
import logger from "./logger.js";
import dotenv from "dotenv";
dotenv.config();

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const AUTH_TAG_LENGTH = 16;
const IV_LENGTH = 12;

export const generateCallToken = async (userId, callId) => {
  try {
    const token = jwt.sign(
      {
        userId,
        callId,
        timestamp: Date.now()
      },
      process.env.CALL_SECRET_KEY,
      { expiresIn: '24h' }
    );

    return token;
  } catch (error) {
    logger.error("Error generating call token:", error);
    throw error;
  }
};

export const validateCallToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.CALL_SECRET_KEY);
    const call = await Call.findById(decoded.callId);

    if (!call) {
      throw new Error("Invalid call");
    }

    const participant = call.participants.find(
      p => p.userId.toString() === decoded.userId
    );

    if (!participant) {
      throw new Error("User not authorized for this call");
    }

    return decoded;
  } catch (error) {
    logger.error("Error validating call token:", error);
    throw error;
  }
};

export const generateCallEncryption = async () => {
  try {
    const key = crypto.randomBytes(KEY_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    return {
      key: key.toString('hex'),
      iv: iv.toString('hex')
    };
  } catch (error) {
    logger.error("Error generating encryption keys:", error);
    throw error;
  }
};

export const encryptCallData = async (data, key, iv) => {
  try {
    const keyBuffer = Buffer.from(key, 'hex');
    const ivBuffer = Buffer.from(iv, 'hex');
    
    const cipher = crypto.createCipheriv(
      ENCRYPTION_ALGORITHM,
      keyBuffer,
      ivBuffer
    );

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      authTag: authTag.toString('hex')
    };
  } catch (error) {
    logger.error("Error encrypting call data:", error);
    throw error;
  }
};

export const validateCallSecurity = async (callId, userId) => {
  try {
    const call = await Call.findById(callId);
    if (!call) throw new Error("Call not found");

    // Check if call is encrypted
    if (!call.security?.encryption?.enabled) {
      return { isSecure: false, reason: "Call encryption not enabled" };
    }

    // Verify participant
    const participant = call.participants.find(
      p => p.userId.toString() === userId
    );
    if (!participant) {
      throw new Error("User not authorized for this call");
    }

    // Check for security flags
    const securityChecks = {
      isEncrypted: true,
      hasValidCertificate: await validateCallCertificate(callId),
      hasSecureConnection: await checkSecureConnection(userId),
      hasMaliciousActivity: false
    };

    return {
      isSecure: Object.values(securityChecks).every(Boolean),
      checks: securityChecks
    };
  } catch (error) {
    logger.error("Error validating call security:", error);
    throw error;
  }
};

export const monitorCallSecurity = async (callId) => {
  try {
    const securityReport = {
      timestamp: new Date(),
      alerts: [],
      status: "secure"
    };

    // Monitor for security issues
    const activeConnections = await getActiveConnections(callId);
    for (const connection of activeConnections) {
      const connectionStatus = await validateConnection(connection);
      if (!connectionStatus.isSecure) {
        securityReport.alerts.push({
          type: "connection_warning",
          details: connectionStatus.reason
        });
        securityReport.status = "warning";
      }
    }

    return securityReport;
  } catch (error) {
    logger.error("Error monitoring call security:", error);
    throw error;
  }
};