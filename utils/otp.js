const nodemailer = require("nodemailer");
const crypto = require("crypto");
const config = require("../config/variables");

const User = require("../models/User");
const {
  registrationOTPTemplate,
  verificationOTPTemplate,
} = require("./emailTemplate");

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
  const newOTP = generateOTP();

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return { error: "User not found" };
    }

    if (user.emailVerified) {
      return { error: "Email already verified" };
    }

    user.otp = newOTP;
    user.otpExpires = Date.now() + 600000; // 10 minutes
    await user.save();

    const emailContent = user.emailVerified
      ? verificationOTPTemplate(newOTP)
      : registrationOTPTemplate(newOTP);
    const subject = user.emailVerified
      ? "SweftPay account verification OTP"
      : "SweftPay registration OTP";

    const emailResult = await sendEmail(email, subject, emailContent);

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
