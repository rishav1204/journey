import { shareReelService } from "../../services/reels/reelShareServices.js";

export const shareReel = async (req, res) => {
  try {
    const { reelId } = req.params;
    const { sharedTo, message } = req.body;
    const userId = req.user.id;

    const result = await shareReelService(reelId, userId, sharedTo, message);

    res.status(200).json({
      success: true,
      message: "Reel shared successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Share failed",
      error: `Share failed: ${error.message}`,
    });
  }
};
