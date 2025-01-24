import {
  followUserService,
  unfollowUserService,
  getFollowingService,
  sendFollowRequestService,
  acceptFollowRequestService,
  rejectFollowRequestService,
} from "../../services/interaction/followService.js";

export const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    const result = await followUserService(userId, followerId);

    res.status(200).json({
      success: true,
      message: "Successfully followed user",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error following user",
      error: error.message,
    });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    const result = await unfollowUserService(userId, followerId);

    res.status(200).json({
      success: true,
      message: "Successfully unfollowed user",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error unfollowing user",
      error: error.message,
    });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const userId = req.user.id;
    const following = await getFollowingService(userId);

    res.status(200).json({
      success: true,
      data: following,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching following list",
      error: error.message,
    });
  }
};

export const sendFollowRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    const result = await sendFollowRequestService(userId, followerId);

    res.status(200).json({
      success: true,
      message: "Follow request sent successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending follow request",
      error: error.message,
    });
  }
};

export const acceptFollowRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const result = await acceptFollowRequestService(userId, currentUserId);

    res.status(200).json({
      success: true,
      message: "Follow request accepted",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error accepting follow request",
      error: error.message,
    });
  }
};

export const rejectFollowRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const result = await rejectFollowRequestService(userId, currentUserId);

    res.status(200).json({
      success: true,
      message: "Follow request rejected",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error rejecting follow request",
      error: error.message,
    });
  }
};
