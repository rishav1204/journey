// src/utils/logger.js
import winston from "winston";
import discordLogger from "./discordLogging.js";

// Custom Discord Transport
class DiscordTransport extends winston.Transport {
  constructor(opts) {
    super(opts);
    this.name = "DiscordTransport";
  }

  async log(info, callback) {
    setImmediate(() => {
      this.emit("logged", info);
    });

    try {
      await discordLogger.logToDiscord(info.message, info.level);
    } catch (error) {
      console.error("Discord transport failed:", error);
    }

    callback();
  }
}

// Create Logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ level, message, timestamp, stack }) => {
      return JSON.stringify({
        timestamp,
        level: level.toUpperCase(),
        message: stack || message,
      });
    })
  ),
  transports: [
    new winston.transports.File({
      filename: "error.log",
      level: "error",
      maxFiles: 5,
      maxsize: 5242880,
    }),
    new winston.transports.File({
      filename: "combined.log",
      maxFiles: 5,
      maxsize: 5242880,
    }),
    new DiscordTransport(),
  ],
});

// Add Console Transport in Development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// Export logger directly
export default logger;
