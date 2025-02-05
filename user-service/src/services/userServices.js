import { unlink } from "fs/promises";
import User from "../database/models/User.js"; // Assuming User model for user data
import { error } from "../utils/errorLogger.js"; // Importing error logger
import hashUtils from "../utils/hash.js";
const { comparePassword } = hashUtils; // Destructure the functions from the default export
import {
  uploadProfilePicture,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

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
  const { travelStyle, preferences } = preferencesData;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        travelStyle: travelStyle,
        preferences: preferences,
      },
    },
    { new: true }
  );

  return {
    success: true,
    data: {
      travelStyle: updatedUser.travelStyle,
      preferences: updatedUser.preferences,
    },
  };
};

// Upload or edit profile picture
export const uploadOrEditProfilePicService = async (userId, file) => {
  try {
    const result = await uploadProfilePicture(file);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePicture: result.url,
        cloudinaryPublicId: result.publicId,
      },
      { new: true }
    );

    // Clean up temp file
    await fs.unlink(file.path);

    return {
      success: true,
      data: {
        profilePicture: updatedUser.profilePicture,
      },
    };
  } catch (error) {
    if (file.path) {
      await fs.unlink(file.path).catch(() => {});
    }
    throw error;
  }
};

// Delete profile picture
export const deleteProfilePicService = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (user.cloudinaryPublicId) {
      // Delete from Cloudinary
      await deleteFromCloudinary(user.cloudinaryPublicId);
    }

    // Update user document
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          profilePicture: null,
          cloudinaryPublicId: null,
        },
      },
      { new: true }
    );

    return {
      success: true,
      message: "Profile picture deleted successfully",
      data: {
        profilePicture: updatedUser.profilePicture,
      },
    };
  } catch (error) {
    error(error);
    throw error;
  }
};

// Update privacy settings (make profile public/private)
export const updatePrivacySettingsService = async (userId, privacyData) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { privacySettings: privacyData },
    { new: true }
  ).select("privacySettings");

  return {
    success: true,
    message: "Privacy settings updated successfully",
    data: {
      privacySettings: updatedUser.privacySettings,
    },
  };
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
export const deactivateAccountService = async (userId, reason, password) => {
  // First fetch the user with password field
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.password) {
    throw new Error("Password not set for this user");
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  // Proceed with deactivation
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        accountStatus: "Deactivated",
        deactivationReason: reason,
        deactivatedAt: new Date(),
      },
    },
    { new: true }
  );

  return updatedUser;
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

export const createPreferencesService = async (userId, preferencesData) => {
  const { travelStyle, preferences } = preferencesData;
  const user = await User.findByIdAndUpdate(
    userId,
    {
      travelStyle,
      preferences: {
        transportation: preferences.transportation,
        budget: preferences.budget,
        accommodation: preferences.accommodation,
        activityType: preferences.activityType,
      },
    },
    { new: true }
  );

  return {
    success: true,
    data: { travelStyle: user.travelStyle, preferences: user.preferences },
  };
};
