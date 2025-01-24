import Comment from "../../models/Comment.js";
import { checkBlockStatus } from "./blockService.js";

export const getCommentsService = async (contentId, contentType) => {
  const comments = await Comment.find({
    contentId,
    contentType,
  })
    .populate("userId", "username profilePicture")
    .populate("replies.userId", "username profilePicture")
    .populate("likes", "username profilePicture")
    .sort({ createdAt: -1 });

  return comments;
};

export const createCommentService = async (
  contentId,
  userId,
  content,
  contentType
) => {
  const contentModel = contentType === "Post" ? Post : Reel;
  const contentExists = await contentModel.findById(contentId);

  if (!contentExists) {
    throw new Error(`${contentType} not found`);
  }

  const comment = await Comment.create({
    contentId,
    contentType,
    userId,
    content,
  });

  return comment.populate("userId", "username profilePicture");
};

export const deleteCommentService = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.userId.toString() !== userId) {
    const content = await mongoose
      .model(comment.contentType)
      .findById(comment.contentId);
    if (content.userId.toString() !== userId) {
      throw new Error("Not authorized to delete this comment");
    }
  }

  await comment.deleteOne();
};

export const likeCommentService = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.likes.includes(userId)) {
    throw new Error("Comment already liked");
  }

  comment.likes.push(userId);
  await comment.save();

  return comment.populate("likes", "username profilePicture");
};

export const unlikeCommentService = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new Error("Comment not found");
  }

  comment.likes = comment.likes.filter((id) => id.toString() !== userId);
  await comment.save();
};

export const replyToCommentService = async (commentId, userId, content) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new Error("Comment not found");
  }

  comment.replies.push({
    userId,
    content,
    createdAt: new Date(),
  });

  await comment.save();
  return comment.populate("replies.userId", "username profilePicture");
};

export const deleteReplyService = async (commentId, replyId, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new Error("Comment not found");
  }

  const replyIndex = comment.replies.findIndex(
    (reply) =>
      reply._id.toString() === replyId && reply.userId.toString() === userId
  );

  if (replyIndex === -1) {
    throw new Error("Reply not found or not authorized to delete");
  }

  comment.replies.splice(replyIndex, 1);
  await comment.save();
};
