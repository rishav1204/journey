import {
  getUserProfileService,
  updateUserProfileService,
  updatePreferencesService,
  uploadOrEditProfilePicService,
  deleteProfilePicService,
  updatePrivacySettingsService,
  getFollowersService,
  getFollowingService,
  deactivateAccountService,
  deleteAccountService,
} from "../services/userServices.js";
import { error } from "../utils/errorLogger.js"; // Importing error logger

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const userProfile = await getUserProfileService(req.user._id);
    return res.status(200).json(userProfile);
  } catch (err) {
    error(err); // Log the error using error logger
    return res
      .status(500)
      .json({ message: "Server error while fetching user profile." });
  }
};

// Update user profile (including bio, location, etc.)
export const updateUserProfile = async (req, res) => {
  try {
    const updatedUserProfile = await updateUserProfileService(
      req.user._id,
      req.body
    );
    return res.status(200).json(updatedUserProfile);
  } catch (err) {
    error(err); // Log the error using error logger
    return res
      .status(500)
      .json({ message: "Server error while updating user profile." });
  }
};

// Update user preferences (e.g., travel style, budget, etc.)
export const updatePreferences = async (req, res) => {
  try {
    const updatedPreferences = await updatePreferencesService(
      req.user._id,
      req.body
    );
    return res.status(200).json(updatedPreferences);
  } catch (err) {
    error(err); // Log the error using error logger
    return res
      .status(500)
      .json({ message: "Error while updating preferences." });
  }
};

// Upload or edit profile picture
export const uploadOrEditProfilePic = async (req, res) => {
  try {
    // Handle the image upload and call the service
    const updatedUserProfile = await uploadOrEditProfilePicService(req.user._id, req.file);
    return res.status(200).json(updatedUserProfile);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error while uploading or editing profile picture." });
  }
};

// Delete profile picture
export const deleteProfilePic = async (req, res) => {
  try {
    const updatedUserProfile = await deleteProfilePicService(req.user._id);
    return res.status(200).json(updatedUserProfile);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error while deleting profile picture." });
  }
};

// Update privacy settings (e.g., make profile public/private)
export const updatePrivacySettings = async (req, res) => {
  try {
    const updatedPrivacySettings = await updatePrivacySettingsService(
      req.user._id,
      req.body
    );
    return res.status(200).json(updatedPrivacySettings);
  } catch (err) {
    error(err); // Log the error using error logger
    return res
      .status(500)
      .json({ message: "Error while updating privacy settings." });
  }
};

// Get followers list
export const getFollowers = async (req, res) => {
  try {
    const followers = await getFollowersService(req.user._id);
    return res.status(200).json(followers);
  } catch (err) {
    error(err); // Log the error using error logger
    return res
      .status(500)
      .json({ message: "Error while fetching followers list." });
  }
};

// Get following list
export const getFollowing = async (req, res) => {
  try {
    const following = await getFollowingService(req.user._id);
    return res.status(200).json(following);
  } catch (err) {
    error(err); // Log the error using error logger
    return res
      .status(500)
      .json({ message: "Error while fetching following list." });
  }
};

// Account deactivation (User only)
export const deactivateAccount = async (req, res) => {
  try {
    const result = await deactivateAccountService(req.user._id);
    return res
      .status(200)
      .json({ message: "Account deactivated successfully." });
  } catch (err) {
    error(err); // Log the error using error logger
    return res
      .status(500)
      .json({ message: "Error while deactivating account." });
  }
};

// Account deletion (User only)
export const deleteAccount = async (req, res) => {
  try {
    const result = await deleteAccountService(req.user._id);
    return res.status(200).json({ message: "Account deleted successfully." });
  } catch (err) {
    error(err); // Log the error using error logger
    return res.status(500).json({ message: "Error while deleting account." });
  }
};
