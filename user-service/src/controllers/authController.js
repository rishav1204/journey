import {
  signUpService,
  loginService,
  adminSignUpService,
  adminLoginService,
  resetPasswordService,
  socialLoginService,
  logoutService,
  forgotPasswordService
} from "../services/authServices.js";
import { sendOTP } from "../services/otpServices.js";
import OTP from "../database/models/Otp.js";
import { checkLoginAttempts } from "../middlewares/loginAttemptMiddleware.js"; // Import the middleware
import { error } from "../utils/errorLogger.js";
import User from "../database/models/User.js";


// Sign-up route (for new users)
export const signUp = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    const response = await signUpService({
      username,
      email,
      password,
      firstName,
      lastName,
    });

    return res.status(201).json(response);
  } catch (err) {
    error(err);
    return res.status(500).json({ message: "Server error during sign-up." });
  }
};

// Login route (for users)
export const login = [
  async (req, res, next) => {
    if (!req.body || !req.body.email || !req.body.password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const { email } = req.body;
    await checkLoginAttempts(email);
    next();
  },

  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Extract device information from request
      const deviceInfo = {
        deviceId: req.headers["device-id"] || `${Date.now()}-${Math.random()}`,
        deviceType: req.headers["device-type"] || "Web",
      };

      const response = await loginService({ email, password, deviceInfo });
      return res.status(200).json(response);
    } catch (err) {
      error(err);
      return res.status(500).json({ message: "Server error during login." });
    }
  },
];


// Admin sign-up route
export const adminSignUp = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Add role automatically in the controller
    const adminData = {
      username,
      email,
      password,
      firstName,
      lastName,
      role: "admin",
    };

    const response = await adminSignUpService(adminData);
    return res.status(201).json(response);
  } catch (err) {
    error(err);
    return res
      .status(500)
      .json({ message: "Server error during admin sign-up." });
  }
};

// Admin login route
export const adminLogin = [
  // Middleware to check login attempts before actual login logic
  async (req, res, next) => {
    try {
      const { email } = req.body;
      await checkLoginAttempts(email); // Call the checkLoginAttempts function here
      next(); // If no error, proceed to adminLoginService
    } catch (err) {
      return res.status(400).json({ message: err.message }); // Send the error if too many attempts
    }
  },

  // Actual login logic
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const response = await adminLoginService({ email, password });

      return res.status(200).json(response);
    } catch (err) {
      error(err);
      return res
        .status(500)
        .json({ message: "Server error during admin login." });
    }
  },
];

// Reset password (email sent to reset the password)
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const response = await forgotPasswordService({ email });

    return res.status(200).json(response);
  } catch (err) {
    error(err);
    return res
      .status(500)
      .json({ message: "Server error during password reset." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const response = await resetPasswordService({
      email,
      otp,
      newPassword,
    });

    return res.status(200).json(response);
  } catch (err) {
    error("Error in reset password:", error);

    if (error.message === "Invalid OTP") {
      return res.status(400).json({ message: error.message });
    }

    if (error.message === "OTP expired") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Error resetting password" });
  }
};


// Social media login (Google/Facebook)
export const socialLogin = async (req, res) => {
  try {
    const { provider, token } = req.body;

    const response = await socialLoginService({ provider, token });

    return res.status(200).json(response);
  } catch (err) {
    error(err);
    return res
      .status(500)
      .json({ message: "Server error during social login." });
  }
};

// Logout route (user logs out)
export const logout = async (req, res) => {
  try {
    const response = await logoutService(req.user);

    return res.status(200).json(response);
  } catch (err) {
    error(err);
    return res.status(500).json({ message: "Server error during logout." });
  }
};


// Send OTP to the user's email
export const sendOTPController = async (req, res) => {
  const { email } = req.body;
  
  try {
    const response = await sendOTP(email);
    return res.status(200).json(response);
  } catch (err) {
    error('Error sending OTP:', error);
    return res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// Verify OTP entered by the user
export const verifyOTPController = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpRecord.expiresAt < Date.now()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP expired" });
    }

    // Update user with { new: true } to get updated document
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    await OTP.deleteOne({ _id: otpRecord._id });

    return res.status(200).json({
      message: "OTP verified successfully",
      user: {
        email: updatedUser.email,
        isVerified: updatedUser.isVerified,
      },
    });
  } catch (err) {
    error("Error verifying OTP:", error);
    return res
      .status(500)
      .json({ message: "Server error during OTP verification" });
  }
};

