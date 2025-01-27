import Save from "../../models/Save.js";
import Reel from "../../models/Reel.js";

export const saveReelService = async (reelId, userId) => {
  // Check if reel exists
  const reel = await Reel.findById(reelId);
  if (!reel) {
    throw new Error("Reel not found");
  }

  // Check if already saved
  const existingSave = await Save.findOne({
    userId,
    contentId: reelId,
    contentType: "reel",
  });

  if (existingSave) {
    throw new Error("Reel already saved");
  }

  // Create new save
  await Save.create({
    userId,
    contentId: reelId,
    contentType: "reel",
  });

  return true;
};

export const unsaveReelService = async (reelId, userId) => {
  const savedReel = await Save.findOne({
    userId,
    contentId: reelId,
    contentType: "reel",
  });

  if (!savedReel) {
    throw new Error("Reel not found in saved items");
  }

  await savedReel.deleteOne();
  return true;
};
