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
  validateSignUp,
  validateLogin,
  validateResetPassword,
  validateAdminSignUp,
  validateAdminLogin,
} from "../middleware/validationMiddleware.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Sign-up route (for new users)
router.post("/sign-up", validateSignUp, signUp); // Register a new user

// Login route (for users)
router.post("/login", validateLogin, login); // User login (email/social)

// Admin sign-up route
router.post("/admin/sign-up", validateAdminSignUp, adminSignUp); // Register a new admin

// Admin login route
router.post("/admin/login", validateAdminLogin, adminLogin); // Admin login

// Reset password (email sent to reset the password)
router.post("/reset-password", validateResetPassword, resetPassword); // Reset password process

// Email verification route (user verification)
router.get("/verify-email/:token", verifyEmail); // Verify email using token

// Social media login (Google/Facebook)
router.post("/social-login", socialLogin); // Login via social media (Google, Facebook)

// Logout route (user logs out)
router.post("/logout", authenticate, logout); // User logout

export default router;
