import winston from "winston";
import discordLogger from "./discordLogging.js";

// Create custom Discord transport using Transport class
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
      console.log("Discord transport received:", info);
      await discordLogger.logToDiscord(info.message, info.level);
    } catch (error) {
      console.error("Discord transport failed:", error);
    }

    callback();
  }
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, stack }) => {
      return JSON.stringify({
        level,
        message: stack || message,
        timestamp,
      });
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
    new DiscordTransport(),
  ],
});

// Test logging
logger.info("Logger initialized");

export const info = (message) => logger.info(message);
export const error = (message) => logger.error(message);
export const warn = (message) => logger.warn(message);
export const debug = (message) => logger.debug(message);
