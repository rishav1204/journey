import OTP from "../database/models/Otp.js"; // Import OTP model
import { generateOTP } from "../utils/otp.js";
import { sendEmail } from "../services/emailServices.js"; 
import { error } from "../utils/errorLogger.js";


export const sendOTP = async (email) => {
  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

    // Store OTP in DB
    const otpEntry = new OTP({ email, otp, expiresAt });
    await otpEntry.save();

    await sendEmail(
      email,
      "Your OTP for Login/Signup",
      `Your OTP is ${otp}. This code will expire in 10 minutes.`,
      `
    <div style="text-align: center;">
      <h1>Login/Signup OTP</h1>
      <h2 style="font-size: 24px; font-weight: bold;">${otp}</h2>
      <p>Use this OTP to verify your email. It will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
    `
    );

    return { message: "OTP sent successfully" };
  } catch (err) {
    error("Error sending OTP:", error);
    throw new Error("Unable to send OTP");
  }
};


export const sendOTPPasswordReset = async (email) => { 
  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

    // Store OTP in DB
    const otpEntry = new OTP({ email, otp, expiresAt });
    await otpEntry.save();

    await sendEmail(
      email,
      "Your OTP for Password Reset",
      `Your OTP is ${otp}. This code will expire in 10 minutes.`,
      `
    <div style="text-align: center;">
      <h1>Password Reset OTP</h1>
      <h2 style="font-size: 24px; font-weight: bold;">${otp}</h2>
      <p>Use this OTP to reset your password. It will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
    `
    );

    return { message: "OTP sent successfully" };
  } catch (err) {
    error("Error sending OTP:", error);
    throw new Error("Unable to send OTP");
  }
}
