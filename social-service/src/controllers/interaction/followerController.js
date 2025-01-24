import {
  getFollowersService,
  removeFollowerService,
  getFollowerRequestsService,
} from "../../services/interaction/followerService.js";

export const getFollowers = async (req, res) => {
  try {
    const userId = req.user.id;
    const followers = await getFollowersService(userId);

    res.status(200).json({
      success: true,
      data: followers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching followers",
      error: error.message,
    });
  }
};

export const removeFollower = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const result = await removeFollowerService(userId, currentUserId);

    res.status(200).json({
      success: true,
      message: "Follower removed successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing follower",
      error: error.message,
    });
  }
};

export const getFollowerRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await getFollowerRequestsService(userId);

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching follower requests",
      error: error.message,
    });
  }
};
