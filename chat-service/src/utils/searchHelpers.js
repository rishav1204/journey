// src/utils/searchHelpers.js

export const createPagination = (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  return {
    skip,
    take: parseInt(limit),
  };
};

export const createSearchQuery = (query, fields) => {
  if (!query) return {};

  return {
    $or: fields.map((field) => ({
      [field]: { $regex: query, $options: "i" },
    })),
  };
};
