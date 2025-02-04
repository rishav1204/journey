// src/utils/encryption.js
import crypto from "crypto";
import { promisify } from "util";
import logger from "./logger.js";

const algorithm = "aes-256-gcm";

export const generateKey = async (password, salt) => {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");
};

export const encryptMessage = async (content) => {
  try {
    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12);
    const key = await generateKey(process.env.MESSAGE_ENCRYPTION_KEY, salt);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(content, "utf8", "hex");
    encrypted += cipher.final("hex");
    const tag = cipher.getAuthTag();

    // Format: salt:iv:tag:encrypted
    return `${salt.toString("hex")}:${iv.toString("hex")}:${tag.toString(
      "hex"
    )}:${encrypted}`;
  } catch (error) {
    logger.error("Error encrypting message:", error);
    throw new Error("Message encryption failed");
  }
};

export const decryptMessage = async (encryptedContent) => {
  try {
    // Validate encrypted content format
    if (
      !encryptedContent ||
      typeof encryptedContent !== "string" ||
      !encryptedContent.includes(":")
    ) {
      logger.error("Invalid encrypted content format");
      return "[Decryption Failed]";
    }

    const [saltHex, ivHex, tagHex, encrypted] = encryptedContent.split(":");

    if (!saltHex || !ivHex || !tagHex || !encrypted) {
      logger.error("Missing encryption components");
      return "[Decryption Failed]";
    }

    const salt = Buffer.from(saltHex, "hex");
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const key = await generateKey(process.env.MESSAGE_ENCRYPTION_KEY, salt);

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    logger.error("Error decrypting message:", error);
    return "[Decryption Failed]";
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
