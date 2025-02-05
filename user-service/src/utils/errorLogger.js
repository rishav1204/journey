import winston from "winston";
import discordLogger from "./discordLogging.js";

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

// Configure logger formats
const logFormat = winston.format.combine(
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
);

// Configure transports
const transports = [
  new winston.transports.Console({
    format: winston.format.simple(),
  }),
  new winston.transports.File({
    filename: "error.log",
    level: "error",
  }),
  new winston.transports.File({
    filename: "combined.log",
  }),
  new DiscordTransport(),
];

// Create logger instance
const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports,
});

// Initialize logger
logger.info("Logger initialized");

// Export logger methods
const loggerMethods = {
  info: (message) => logger.info(message),
  error: (message) => logger.error(message),
  warn: (message) => logger.warn(message),
  debug: (message) => logger.debug(message),
};

export default loggerMethods;
export const { info, error, warn, debug } = loggerMethods;
