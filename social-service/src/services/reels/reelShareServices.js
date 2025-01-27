import Reel from "../../models/Reel.js";
import Share from "../../models/Share.js";
import axios from "axios";

const CHAT_SERVICE_URL =
  process.env.CHAT_SERVICE_URL || "http://localhost:5002";

export const shareReelService = async (
  reelId,
  userId,
  recipientId,
  message
) => {
  try {
    // Validate required fields
    if (!reelId || !userId || !recipientId) {
      throw new Error("Missing required fields");
    }

    // Verify reel exists
    const reel = await Reel.findById(reelId).populate(
      "userId",
      "username profilePicture"
    );

    if (!reel) {
      throw new Error("Reel not found");
    }

    // Create share record
    const share = await Share.create({
      userId,
      sharedTo: recipientId,
      contentId: reelId,
      contentType: "reel",
      message: message || "",
    });

    // Increment share count
    reel.shares = (reel.shares || 0) + 1;
    await reel.save();

    // Prepare share content
    const shareContent = {
      senderId: userId,
      recipientId,
      messageType: "reel_share",
      shareId: share._id,
      content: {
        reelId: reel._id,
        message: message || "",
        preview: {
          type: "video",
          url: reel.videoUrl,
          caption: reel.description,
          author: reel.userId.username,
          authorPicture: reel.userId.profilePicture,
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
      await Reel.findByIdAndUpdate(reelId, { $inc: { shares: -1 } });
      throw new Error("Failed to share reel in chat");
    }

    // Update share with chat message ID
    share.chatMessageId = response.data.messageId;
    await share.save();

    return {
      shareId: share._id,
      reelId: reel._id,
      sharedWith: recipientId,
      messageId: response.data.messageId,
    };
  } catch (error) {
    throw new Error(`Share failed: ${error.message}`);
  }
};
