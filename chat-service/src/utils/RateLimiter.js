import redisClient from "../config/redis.js";

class RateLimiter {
  constructor(prefix, limit, window) {
    this.prefix = prefix;
    this.limit = limit;
    this.window = window;
  }

  async consume(identifier) {
    const key = `${this.prefix}:${identifier}`;

    try {
      const multi = redisClient.multi();
      multi.incr(key);
      multi.expire(key, this.window);

      const [count] = await multi.exec();
      const attempts = count[1];

      return {
        success: attempts <= this.limit,
        remaining: Math.max(this.limit - attempts, 0),
        resetAfter: this.window,
      };
    } catch (error) {
      console.error("Rate limiter error:", error);
      return { success: true, remaining: this.limit, resetAfter: this.window };
    }
  }
}

export default RateLimiter;
