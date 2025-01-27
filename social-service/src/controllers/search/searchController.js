// src/controllers/search/searchController.js
import {
  searchUsersService,
  searchPostsService,
  searchReelsService,
  searchByLocationService,
  searchByTagsService,
} from "../../services/search/searchServices.js";

export const searchUsers = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    const viewerId = req.user.id;

    const users = await searchUsersService(query, page, limit, viewerId);

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching users",
      error: error.message,
    });
  }
};

export const searchPosts = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    const viewerId = req.user.id;

    const posts = await searchPostsService(query, page, limit, viewerId);

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching posts",
      error: error.message,
    });
  }
};

export const searchReels = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    const viewerId = req.user.id;

    const reels = await searchReelsService(query, page, limit, viewerId);

    res.status(200).json({
      success: true,
      data: reels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching reels",
      error: error.message,
    });
  }
};

export const searchByLocation = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    const viewerId = req.user.id;

    const results = await searchByLocationService(query, page, limit, viewerId);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching by location",
      error: error.message,
    });
  }
};

export const searchByTags = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    const viewerId = req.user.id;

    const results = await searchByTagsService(query, page, limit, viewerId);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching by tags",
      error: error.message,
    });
  }
};
