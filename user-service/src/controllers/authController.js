import {
  signUpService,
  loginService,
  adminSignUpService,
  adminLoginService,
  resetPasswordService,
  verifyEmailService,
  socialLoginService,
  logoutService,
} from "../services/authServices.js";
import { sendOTP } from "../services/otpServices.js";
import OTP from "../database/models/Otp.js";
import { checkLoginAttempts } from "../middlewares/loginAttemptMiddleware.js"; // Import the middleware
import { error } from "../utils/errorLogger.js";


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
  // Middleware to check login attempts before actual login logic
  async (req, res, next) => {
    try {
      const { email } = req.body;
      await checkLoginAttempts(email); // Call the checkLoginAttempts function here
      next(); // If no error, proceed to loginService
    } catch (err) {
      return res.status(400).json({ message: err.message }); // Send the error if too many attempts
    }
  },

  // Actual login logic
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const response = await loginService({ email, password });

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

    const response = await adminSignUpService({
      username,
      email,
      password,
      firstName,
      lastName,
    });

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
export const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const response = await resetPasswordService({ email });

    return res.status(200).json(response);
  } catch (err) {
    error(err);
    return res
      .status(500)
      .json({ message: "Server error during password reset." });
  }
};

// Email verification route (user verification)
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const response = await verifyEmailService({ token });

    return res.status(200).json(response);
  } catch (err) {
    error(err);
    return res
      .status(500)
      .json({ message: "Server error during email verification." });
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
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// Verify OTP entered by the user
export const verifyOTPController = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find the OTP in the database
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    // OTP is valid
    return res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ message: 'Server error during OTP verification' });
  }
};
