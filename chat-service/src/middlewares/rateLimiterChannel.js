import RateLimiter from "../utils/RateLimiter.js";

const messageRateLimiter = new RateLimiter("message", 50, 60); // 50 messages per minute
const joinRateLimiter = new RateLimiter("join", 5, 3600); // 5 joins per hour

export const messageRateLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const channelId = req.params.channelId;
    const key = `${userId}:${channelId}`;

    const result = await messageRateLimiter.consume(key);

    if (!result.success) {
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. Try again in ${result.resetAfter} seconds`,
        resetAfter: result.resetAfter,
      });
    }

    res.set({
      "X-RateLimit-Remaining": result.remaining,
      "X-RateLimit-Reset": result.resetAfter,
    });

    next();
  } catch (error) {
    next(error);
  }
};

export const joinRateLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await joinRateLimiter.consume(userId);

    if (!result.success) {
      return res.status(429).json({
        success: false,
        message: `Join rate limit exceeded. Try again in ${result.resetAfter} seconds`,
        resetAfter: result.resetAfter,
      });
    }

    res.set({
      "X-RateLimit-Remaining": result.remaining,
      "X-RateLimit-Reset": result.resetAfter,
    });

    next();
  } catch (error) {
    next(error);
  }
};
