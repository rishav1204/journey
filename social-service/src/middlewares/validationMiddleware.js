export const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;

  if ((page && !Number.isInteger(Number(page))) || page < 1) {
    return res.status(400).json({
      success: false,
      message: "Invalid page number",
    });
  }

  if ((limit && !Number.isInteger(Number(limit))) || limit < 1) {
    return res.status(400).json({
      success: false,
      message: "Invalid limit number",
    });
  }

  next();
};


export const validateComment = (req, res, next) => {
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Comment content is required",
    });
  }

  if (content.length > 1000) {
    return res.status(400).json({
      success: false,
      message: "Comment content exceeds maximum length",
    });
  }

  next();
};


