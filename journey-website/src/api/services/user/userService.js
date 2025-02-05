// src/api/services/user/userService.js
import axios from "axios";

const API_URL = "http://localhost:8080/api/identity"; // Your user-service base URL

export const userService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await axios.get(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update profile
  updateProfile: async (profileData) => {
    try {
      const response = await axios.put(`${API_URL}/profile`, profileData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update preferences
updatePreferences: async (preferences) => {
  try {
    const response = await axios.put(
      `${API_URL}/preferences`,
      preferences,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
},

  // Upload profile picture
  uploadProfilePicture: async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/profile-pic`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update privacy settings
  updatePrivacySettings: async (settings) => {
  try {
    const response = await axios.put(
      `${API_URL}/profile/privacy`,
      settings,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
},

  // Get followers
  getFollowers: async () => {
    try {
      const response = await axios.get(`${API_URL}/followers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get following
  getFollowing: async () => {
    try {
      const response = await axios.get(`${API_URL}/following`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Deactivate account
  deactivateAccount: async (reason) => {
    try {
      const response = await axios.post(
        `${API_URL}/deactivate`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete account
  deleteAccount: async () => {
    try {
      const response = await axios.delete(`${API_URL}/delete`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
