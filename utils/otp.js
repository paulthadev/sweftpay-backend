const nodemailer = require("nodemailer");
const crypto = require("crypto");
const config = require("../config/variables");
const emailTemplate = require("./emailTemplate");

const User = require("../models/User");

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const sendEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: "sweftpay.com",
    port: 465,
    secure: true,
    auth: {
      user: config.EMAIL,
      pass: config.PASS,
    },
  });
  const mailOptions = {
    to: email,
    from: `SweftPay < ${config.EMAIL}>`,
    subject: "Verfication code",
    html: emailTemplate(otp),
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (err) {
    console.error("Error sending email:", err);
    return { error: "Failed to send email" };
  }
};

// To resend otp to the mail
const resendOTP = async (email) => {
  const newOTP = generateOTP(); // Generate a new OTP

  try {
    // Find the user by email and update their OTP
    const user = await User.findOneAndUpdate(
      { email },
      { otp: newOTP },
      { new: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    // Send the new OTP to the user's email
    const emailResult = await sendEmail(email, newOTP);
    if (emailResult.error) {
      return { error: emailResult.error };
    }

    return { success: true };
  } catch (err) {
    console.error("Error resending OTP:", err);
    return { error: "Failed to resend OTP" };
  }
};

module.exports = { generateOTP, sendEmail, resendOTP };
