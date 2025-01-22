import nodemailer from "nodemailer";
import OTP from "../database/models/Otp.js"; // Import OTP model
import { generateOTP } from "../utils/otp.js";
import { sendEmail } from "../services/emailServices.js"; 

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Example using Gmail
  auth: {
    user: process.env.EMAIL_USER, // Your email address (e.g., 'your-email@gmail.com')
    pass: process.env.EMAIL_PASSWORD, // Your email password
  },
});

export const sendOTP = async (email) => {
  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

    // Store OTP in DB
    const otpEntry = new OTP({ email, otp, expiresAt });
    await otpEntry.save();

    // Define email content
    const subject = "Your OTP for Login/Signup";
    const text = `Your OTP is ${otp}. It will expire in 5 minutes.`;

    // Send OTP email using sendEmail function
    await sendEmail(email, subject, text);

    return { message: "OTP sent successfully" };
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Unable to send OTP");
  }
};
