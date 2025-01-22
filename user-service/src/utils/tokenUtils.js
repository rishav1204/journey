import jwt from "jsonwebtoken";
import redis from "redis";
import { promisify } from "util";
import { error, info } from "../utils/errorLogger.js";

// Redis setup for token blacklist
const redisClient = redis.createClient();
const setAsync = promisify(redisClient.set).bind(redisClient);
const getAsync = promisify(redisClient.get).bind(redisClient);
const expireAsync = promisify(redisClient.expire).bind(redisClient);

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "1h"; // Token expiration time
const RESET_TOKEN_EXPIRY = process.env.RESET_TOKEN_EXPIRY || "15m"; // Reset token expiration time

/**
 * Generate a JWT token
 * @param {object} payload - Data to embed in the token
 * @param {string} [expiry=JWT_EXPIRY] - Optional expiration time
 * @returns {string} - Signed JWT token
 */
export const generateToken = (payload, expiry = JWT_EXPIRY) => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: expiry });
    info("Token generated successfully.");
    return token;
  } catch (err) {
    error("Error generating token:", err);
    throw new Error("Token generation failed.");
  }
};

/**
 * Verify a JWT token
 * @param {string} token - Token to verify
 * @returns {object} - Decoded token data
 */
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    info("Token verified successfully.");
    return decoded;
  } catch (err) {
    error("Error verifying token:", err);
    throw new Error("Token verification failed.");
  }
};

/**
 * Decode a JWT token without verifying
 * @param {string} token - Token to decode
 * @returns {object|null} - Decoded token data or null
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (err) {
    error("Error decoding token:", err);
    throw new Error("Token decoding failed.");
  }
};

/**
 * Blacklist a JWT token
 * @param {string} token - Token to blacklist
 */
export const addToTokenBlacklist = async (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      throw new Error("Invalid token structure.");
    }

    const expiryTime = decoded.exp - Math.floor(Date.now() / 1000); // Remaining time in seconds
    if (expiryTime <= 0) {
      info("Token already expired, no need to blacklist.");
      return;
    }

    await setAsync(`blacklist:${token}`, "blacklisted");
    await expireAsync(`blacklist:${token}`, expiryTime); // Automatically remove after expiration
    info("Token blacklisted successfully.");
  } catch (err) {
    error("Error blacklisting token:", err);
    throw new Error("Failed to blacklist token.");
  }
};

/**
 * Check if a JWT token is blacklisted
 * @param {string} token - Token to check
 * @returns {boolean} - Whether the token is blacklisted
 */
export const isTokenBlacklisted = async (token) => {
  try {
    const result = await getAsync(`blacklist:${token}`);
    return result === "blacklisted";
  } catch (err) {
    error("Error checking token blacklist:", err);
    throw new Error("Failed to check token blacklist.");
  }
};

/**
 * Generate a password reset token
 * @param {object} payload - Data to embed in the reset token
 * @returns {string} - Signed reset token
 */
export const generateResetToken = (payload) => {
  return generateToken(payload, RESET_TOKEN_EXPIRY);
};
