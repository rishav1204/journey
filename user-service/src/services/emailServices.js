import nodemailer from "nodemailer";

// Create a reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail", // Example using Gmail
  auth: {
    user: process.env.EMAIL_USER, // Your email address (e.g., 'your-email@gmail.com')
    pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
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
export const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to, // List of recipients
      subject, // Subject line
      text, // Plain text body
    };

    // Send email using the transporter
    await transporter.sendMail(mailOptions);

    return { message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
