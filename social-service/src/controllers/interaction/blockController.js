import {
  blockUserService,
  unblockUserService,
  getBlockedUsersService,
} from "../../services/interaction/blockService.js";

export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const blockedBy = req.user.id;

    const result = await blockUserService(userId, blockedBy);

    res.status(200).json({
      success: true,
      message: "User blocked successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error blocking user",
      error: error.message,
    });
  }
};


export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const unblockedBy = req.user.id;

    const result = await unblockUserService(userId, unblockedBy);

    res.status(200).json({
      success: true,
      message: "User unblocked successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error unblocking user",
      error: error.message,
    });
  }
};

export const getBlockedUsers = async (req, res) => {
  try {
    const userId = req.user.id;

    const blockedUsers = await getBlockedUsersService(userId);

    res.status(200).json({
      success: true,
      data: blockedUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching blocked users",
      error: error.message,
    });
  }
};
