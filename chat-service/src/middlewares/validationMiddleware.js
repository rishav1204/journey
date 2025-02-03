// Add to middlewares/validationMiddleware.js
export const validateSearchQuery = [
  query("query").optional().trim().isString(),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("startDate").optional().isISO8601(),
  query("endDate").optional().isISO8601(),
  query("type").optional().isIn(["text", "media", "file", "location", "all"]),
];
