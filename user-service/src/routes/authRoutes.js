import express from "express";
import {
  signUp,
  login,
  resetPassword,
  verifyEmail,
  logout,
  socialLogin,
  adminSignUp,
  adminLogin,
} from "../controllers/authController.js";
import {
  sendOTPController,
  verifyOTPController,
} from "../controllers/authController.js";
import {
  validateSignUp,
  validateLogin,
  validateResetPassword,
  validateAdminSignUp,
  validateAdminLogin,
  validateEmail
} from "../middlewares/validationMiddleware.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Sign-up route (for new users)
router.post("/sign-up", rateLimiter,validateSignUp, signUp); // Register a new user

// Login route (for users)
router.post("/login", rateLimiter,validateLogin, login); // User login (email/social)

// Admin sign-up route
router.post("/admin/sign-up", validateAdminSignUp, adminSignUp); // Register a new admin

// Admin login route
router.post("/admin/login", validateAdminLogin, adminLogin); // Admin login

// Route to send OTP to the user's email
router.post('/send-otp', validateEmail, sendOTPController);

// Route to verify OTP
router.post('/verify-otp', verifyOTPController);

// Reset password (email sent to reset the password)
router.post("/reset-password", rateLimiter, validateResetPassword, resetPassword); // Reset password process

// Email verification route (user verification)
router.get("/verify-email/:token", verifyEmail); // Verify email using token

// Social media login (Google/Facebook)
router.post("/social-login", rateLimiter, socialLogin); // Login via social media (Google, Facebook)

// Logout route (user logs out)
router.post("/logout", authenticate, logout); // User logout

export default router;
