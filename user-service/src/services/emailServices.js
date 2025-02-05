import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { error } from "../utils/errorLogger.js";
dotenv.config();

// Create a reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

/**
 * Send an email.
 *
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} text - The plain text content of the email.
 * @param {string} [html] - Optional HTML content for the email.
 * @returns {Promise<object>} - Success or error response.
 */
export const sendEmail = async (to, subject, text, html) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Journey App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    error("Email service error:", err);
    throw new Error(`Failed to send email: ${err.message}`);
  }
};
