// src/services/authService.js
import axios from "axios";

const API_URL = "http://localhost:3003/api/auth";

export const authService = {
  signup: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/sign-up`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  sendOtp: async (email) => {
    try {
      const response = await axios.post(`${API_URL}/send-otp`, { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  verifyOtp: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/verify-otp`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, {
        email,
      });
      return response.data;
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error.response?.data || { message: "Failed to send reset code" };
    }
  },

  resetPassword: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/reset-password`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
