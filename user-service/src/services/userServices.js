import fs from "fs";
import path from "path";
import User from "../database/models/User.js"; // Assuming User model for user data
import { error } from "../utils/errorLogger.js"; // Importing error logger

// Get user profile
export const getUserProfileService = async (userId) => {
  try {
    const userProfile = await User.findById(userId).select("-password");
    if (!userProfile) {
      throw new Error("User not found");
    }
    return userProfile;
  } catch (err) {
    error(err);
    throw err;
  }
};

// Update user profile (bio, location, etc.)
export const updateUserProfileService = async (userId, updateData) => {
  try {
    const updatedUserProfile = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );
    if (!updatedUserProfile) {
      throw new Error("User not found");
    }
    return updatedUserProfile;
  } catch (err) {
    error(err);
    throw err;
  }
};

// Update user preferences (travel style, budget, etc.)
export const updatePreferencesService = async (userId, preferencesData) => {
  try {
    // Assuming preferences are stored in the same user model
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { preferences: preferencesData },
      { new: true }
    );
    if (!updatedUser) {
      throw new Error("User not found");
    }
    return updatedUser.preferences; // Return updated preferences
  } catch (err) {
    error(err);
    throw err;
  }
};

// Upload or edit profile picture
export const uploadOrEditProfilePicService = async (userId, file) => {
  try {
    // Check if a file is uploaded
    if (!file) {
      throw new Error("No file uploaded");
    }

    // Assuming you're storing the image in a local folder or cloud
    const profilePicUrl = `https://yourcdn.com/${file.filename}`; // Replace with your actual URL logic

    // Update the user's profile picture URL
    const updatedUserProfile = await User.findByIdAndUpdate(
      userId,
      { profilePic: profilePicUrl },
      { new: true }
    );

    if (!updatedUserProfile) {
      throw new Error("User not found");
    }

    return updatedUserProfile;
  } catch (err) {
    error(err);
    throw err;
  }
};

// Delete profile picture
export const deleteProfilePicService = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // If a profile picture exists, delete the file from the server (if stored locally)
    if (user.profilePic) {
      const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        "profile-pics",
        path.basename(user.profilePic)
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Delete the file
      }
    }

    // Remove the profile picture URL from the user's record
    user.profilePic = null;
    await user.save();

    return user;
  } catch (err) {
    error(err);
    throw err;
  }
};

// Update privacy settings (make profile public/private)
export const updatePrivacySettingsService = async (userId, privacyData) => {
  try {
    const updatedPrivacySettings = await User.findByIdAndUpdate(
      userId,
      { privacySettings: privacyData },
      { new: true }
    );
    if (!updatedPrivacySettings) {
      throw new Error("User not found");
    }
    return updatedPrivacySettings;
  } catch (err) {
    error(err);
    throw err;
  }
};

// Get followers list
export const getFollowersService = async (userId) => {
  try {
    const user = await User.findById(userId).populate(
      "followers",
      "username email"
    );
    if (!user) {
      throw new Error("User not found");
    }
    return user.followers;
  } catch (err) {
    error(err);
    throw err;
  }
};

// Get following list
export const getFollowingService = async (userId) => {
  try {
    const user = await User.findById(userId).populate(
      "following",
      "username email"
    );
    if (!user) {
      throw new Error("User not found");
    }
    return user.following;
  } catch (err) {
    error(err);
    throw err;
  }
};

// Account deactivation (User only)
export const deactivateAccountService = async (userId) => {
  try {
    const deactivatedUser = await User.findByIdAndUpdate(
      userId,
      { active: false },
      { new: true }
    );
    if (!deactivatedUser) {
      throw new Error("User not found");
    }
    return deactivatedUser;
  } catch (err) {
    error(err);
    throw err;
  }
};

// Account deletion (User only)
export const deleteAccountService = async (userId) => {
  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      throw new Error("User not found");
    }
    return deletedUser;
  } catch (err) {
    error(err);
    throw err;
  }
};
