// src/utils/encryption.js
import crypto from "crypto";
import { promisify } from "util";

const algorithm = "aes-256-gcm";
const keyLength = 32;
const ivLength = 16;
const saltLength = 64;
const tagLength = 16;

// Convert callback-based crypto functions to promise-based
const scrypt = promisify(crypto.scrypt);
const randomBytes = promisify(crypto.randomBytes);

/**
 * Generate encryption key from password and salt
 */
const generateKey = async (password, salt) => {
  return scrypt(password, salt, keyLength);
};

/**
 * Encrypt message content
 */
export const encryptMessage = async (content) => {
  try {
    // Generate random salt and IV
    const salt = await randomBytes(saltLength);
    const iv = await randomBytes(ivLength);

    // Generate encryption key
    const key = await generateKey(process.env.MESSAGE_ENCRYPTION_KEY, salt);

    // Create cipher
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    // Encrypt content
    let encrypted = cipher.update(content, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Get authentication tag
    const tag = cipher.getAuthTag();

    // Combine all components for storage
    // Format: salt:iv:tag:encrypted
    return `${salt.toString("hex")}:${iv.toString("hex")}:${tag.toString(
      "hex"
    )}:${encrypted}`;
  } catch (error) {
    logger.error("Error encrypting message:", error);
    throw new Error("Message encryption failed");
  }
};

/**
 * Decrypt message content
 */
export const decryptMessage = async (encryptedContent) => {
  try {
    // Split components
    const [salt, iv, tag, encrypted] = encryptedContent
      .split(":")
      .map((str) => Buffer.from(str, "hex"));

    // Generate decryption key
    const key = await generateKey(process.env.MESSAGE_ENCRYPTION_KEY, salt);

    // Create decipher
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(tag);

    // Decrypt content
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    logger.error("Error decrypting message:", error);
    throw new Error("Message decryption failed");
  }
};

/**
 * Verify message integrity
 */
export const verifyMessageIntegrity = async (
  encryptedContent,
  expectedHash
) => {
  try {
    const hash = crypto.createHash("sha256");
    hash.update(encryptedContent);
    const actualHash = hash.digest("hex");

    return actualHash === expectedHash;
  } catch (error) {
    logger.error("Error verifying message integrity:", error);
    throw new Error("Message integrity verification failed");
  }
};
