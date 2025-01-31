import Redis from "ioredis";
import { PermissionError } from "../utils/errors.js";

const redis = new Redis(process.env.REDIS_URL);

export const messageRateLimit = async (req, res, next) => {
  const { channelId } = req.params;
  const userId = req.user.id;
  const key = `rateLimit:message:${channelId}:${userId}`;

  try {
    const channel = await Channel.findById(channelId);
    const { count, timeWindow } = channel.rateLimits.messages;

    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, timeWindow);
    }

    if (current > count) {
      throw new PermissionError(
        `Rate limit exceeded. Try again in ${timeWindow} seconds`
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const joinRequestRateLimit = async (req, res, next) => {
  const userId = req.user.id;
  const key = `rateLimit:join:${userId}`;

  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, 3600); // 1 hour window
    }

    if (current > 5) {
      throw new PermissionError(
        "Join request rate limit exceeded. Try again in 1 hour"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
