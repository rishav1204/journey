import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { error } from "../utils/errorLogger.js";
dotenv.config();

// Create a reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Use the App Password here, not your regular Gmail password
  },
  tls: {
    rejectUnauthorized: false,
  },
});

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
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    };

    await transporter.sendMail(mailOptions);
    return { message: "Email sent successfully" };
  } catch (err) {
    error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

