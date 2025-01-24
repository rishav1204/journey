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
