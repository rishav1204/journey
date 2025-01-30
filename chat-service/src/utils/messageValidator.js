// src/utils/messageValidator.js
const MAX_TEXT_LENGTH = 5000;
const MAX_MEDIA_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_MEDIA_TYPES = ["image", "video", "audio", "document"];
const RESTRICTED_PATTERNS = [
  /^\/[a-zA-Z]+/, // Command patterns
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi, // Script tags
  /<[^\s].*?>/g, // HTML tags
];

export const validateMessageContent = (content, type = "text") => {
  try {
    // Basic validation
    if (!content) {
      return {
        isValid: false,
        error: "Message content cannot be empty",
      };
    }

    // Text message validation
    if (type === "text") {
      // Check length
      if (content.length > MAX_TEXT_LENGTH) {
        return {
          isValid: false,
          error: `Message exceeds maximum length of ${MAX_TEXT_LENGTH} characters`,
        };
      }

      // Check for restricted patterns
      for (const pattern of RESTRICTED_PATTERNS) {
        if (pattern.test(content)) {
          return {
            isValid: false,
            error: "Message contains restricted content",
          };
        }
      }
    }

    // Media message validation
    if (ALLOWED_MEDIA_TYPES.includes(type)) {
      if (!content.size || content.size > MAX_MEDIA_SIZE) {
        return {
          isValid: false,
          error: `Media size must be less than ${
            MAX_MEDIA_SIZE / (1024 * 1024)
          }MB`,
        };
      }

      if (!content.type || !content.type.startsWith(type)) {
        return {
          isValid: false,
          error: `Invalid media type. Allowed types: ${ALLOWED_MEDIA_TYPES.join(
            ", "
          )}`,
        };
      }
    }

    return {
      isValid: true,
    };
  } catch (error) {
    logger.error("Error in validateMessageContent:", error);
    return {
      isValid: false,
      error: "Message validation failed",
    };
  }
};
