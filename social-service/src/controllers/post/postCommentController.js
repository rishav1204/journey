import {
  createCommentService,
  deleteCommentService,
  getCommentsService,
  likeCommentService,
  unlikeCommentService,
  replyToCommentService,
  deleteReplyService,
} from "../../services/post/postCommentServices.js";

export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await getCommentsService(postId, "Post");

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching comments",
      error: error.message,
    });
  }
};

export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await createCommentService(postId, userId, content, "Post");

    res.status(201).json({
      success: true,
      message: "Comment posted successfully",
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating comment",
      error: error.message,
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    await deleteCommentService(commentId, userId);

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting comment",
      error: error.message,
    });
  }
};

export const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const result = await likeCommentService(commentId, userId);

    res.status(200).json({
      success: true,
      message: "Comment liked successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error liking comment",
      error: error.message,
    });
  }
};

export const unlikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    await unlikeCommentService(commentId, userId);

    res.status(200).json({
      success: true,
      message: "Comment unliked successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error unliking comment",
      error: error.message,
    });
  }
};

export const replyToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const result = await replyToCommentService(commentId, userId, content);

    res.status(201).json({
      success: true,
      message: "Reply posted successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding reply",
      error: error.message,
    });
  }
};

export const deleteReply = async (req, res) => {
  try {
    const { commentId, replyId } = req.params;
    const userId = req.user.id;

    await deleteReplyService(commentId, replyId, userId);

    res.status(200).json({
      success: true,
      message: "Reply deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting reply",
      error: error.message,
    });
  }
};

