import Redis from "ioredis";
import logger from "../utils/logger.js";

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    logger.info(`Retrying Redis connection in ${delay}ms...`);
    return delay;
  },
});

redisClient.on("error", (err) => logger.error("Redis Client Error", err));
redisClient.on("connect", () => logger.info("Redis Client Connected"));
redisClient.on("ready", () => logger.info("Redis Client Ready"));

export default redisClient;
