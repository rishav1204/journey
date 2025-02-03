// src/middlewares/deviceCompatibilityMiddleware.js
import { validateDeviceCompatibility } from "../utils/deviceUtils.js";
import logger from "../utils/logger.js";

export const deviceCompatibilityCheck = async (req, res, next) => {
  try {
    const userAgent = req.headers["user-agent"];
    const compatibilityResult = await validateDeviceCompatibility(userAgent);

    if (!compatibilityResult.isCompatible) {
      logger.warn("Device compatibility check failed", {
        userAgent,
        reason: compatibilityResult.reason,
      });

      return res.status(400).json({
        success: false,
        message: "Device compatibility check failed",
        details: compatibilityResult,
      });
    }

    // Add device info to request for later use
    req.deviceInfo = compatibilityResult.deviceInfo;
    next();
  } catch (error) {
    logger.error("Error in device compatibility check:", error);
    next(error);
  }
};
