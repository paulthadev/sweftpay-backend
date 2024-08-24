const nodemailer = require("nodemailer");
const crypto = require("crypto");
const config = require("../config/variables");

const User = require("../models/User");

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const sendEmail = async (email, subject, htmlContent) => {
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
    subject: subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (err) {
    console.error("Error sending email:", err);
    return { error: "Failed to send email" };
  }
};

const resendOTP = async (email) => {
  const newOTP = generateOTP(); // Generate a new OTP

  try {
    // Find the user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return { error: "User not found" };
    }

    // Check if the user's email is already verified
    if (user.emailVerified) {
      return { error: "Email already verified" };
    }

    // Update the user's OTP
    user.otp = newOTP;
    user.otpExpires = Date.now() + 3600000; // Set OTP expiration time (1 hour)
    await user.save();

    // Send the new OTP to the user's email
    const emailContent = otpEmailTemplate(newOTP);
    const emailResult = await sendEmail(
      email,
      "SweftPay SignUp OTP",
      emailContent
    );

    if (emailResult.error) {
      return { error: "Failed to send email" };
    }

    return { success: true };
  } catch (err) {
    console.error("Error resending OTP:", err);
    return { error: "Failed to resend OTP" };
  }
};

module.exports = { generateOTP, sendEmail, resendOTP };
