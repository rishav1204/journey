import {
  saveReelService,
  unsaveReelService,
} from "../../services/reel/reelSaveServices.js";

export const saveReel = async (req, res) => {
  try {
    const { reelId } = req.params;
    const userId = req.user.id;

    await saveReelService(reelId, userId);

    res.status(200).json({
      success: true,
      message: "Reel saved successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const unsaveReel = async (req, res) => {
  try {
    const { reelId } = req.params;
    const userId = req.user.id;

    await unsaveReelService(reelId, userId);

    res.status(200).json({
      success: true,
      message: "Reel unsaved successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
