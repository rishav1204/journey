import Save from "../../models/Save.js";
import Post from "../../models/Post.js";

export const savePostService = async (postId, userId) => {
  // Check if post exists
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error("Post not found");
  }

  // Check if already saved
  const existingSave = await Save.findOne({
    userId,
    contentId: postId,
    contentType: "post",
  });

  if (existingSave) {
    throw new Error("Post already saved");
  }

  // Create new save
  await Save.create({
    userId,
    contentId: postId,
    contentType: "post",
  });

  return true;
};

export const unsavePostService = async (postId, userId) => {
  const savedPost = await Save.findOne({
    userId,
    contentId: postId,
    contentType: "post",
  });

  if (!savedPost) {
    throw new Error("Post not found in saved items");
  }

  await savedPost.deleteOne();
  return true;
};


