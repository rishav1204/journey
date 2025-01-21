import winston from "winston";
import logToDiscord from "./discordLogging.utils.js";

// Custom Discord transport
const discordTransport = new winston.transports.Stream({
  stream: {
    write: async (message) => {
      const parsed = JSON.parse(message);
      await logToDiscord(parsed.message, parsed.level);
    },
  },
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
    discordTransport, // Add Discord transport
  ],
});

export const info = (message) => {
  logger.info(message);
};

export const error = (message) => {
  logger.error(message);
};

export const warn = (message) => {
  logger.warn(message);
};

export default logger;
