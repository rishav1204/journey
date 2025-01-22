import rateLimit from "express-rate-limit";

// Rate Limiter Configuration
export const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 100 requests per `windowMs`
  message: {
    message:
      "Too many requests, please try again after 1 minute.",
  },
  standardHeaders: true, // Include rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
