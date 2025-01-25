import Post from "../../models/Post.js";
import Share from "../../models/Share.js";
import axios from "axios";

const CHAT_SERVICE_URL =
  process.env.CHAT_SERVICE_URL || "http://localhost:5002";

export const sharePostService = async (
  postId,
  userId,
  recipientId,
  message
) => {
  try {
    // Verify post exists
    const post = await Post.findById(postId).populate(
      "userId",
      "username profilePicture"
    );

    if (!post) {
      throw new Error("Post not found");
    }

    // Create share record
    const share = await Share.create({
      userId,
      recipientId,
      contentId: postId,
      contentType: "post",
      message: message || "",
    });

    // Increment share count
    post.shares += 1;
    await post.save();

    // Prepare share content
    const shareContent = {
      senderId: userId,
      recipientId,
      messageType: "post_share",
      shareId: share._id,
      content: {
        postId: post._id,
        message: message || "",
        preview: {
          type: post.media[0]?.type || "text",
          url: post.media[0]?.url || "",
          caption: post.caption,
          author: post.userId.username,
          authorPicture: post.userId.profilePicture,
        },
      },
    };

    // Send to chat service
    const response = await axios.post(
      `${CHAT_SERVICE_URL}/api/messages/share`,
      shareContent,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.INTERNAL_API_KEY}`,
        },
      }
    );

    if (!response.data.success) {
      // Rollback share creation if chat service fails
      await share.deleteOne();
      await Post.findByIdAndUpdate(postId, { $inc: { shares: -1 } });
      throw new Error("Failed to share post in chat");
    }

    // Update share with chat message ID
    share.chatMessageId = response.data.messageId;
    await share.save();

    return {
      shareId: share._id,
      postId: post._id,
      sharedWith: recipientId,
      messageId: response.data.messageId,
    };
  } catch (error) {
    throw new Error(`Share failed: ${error.message}`);
  }
};
