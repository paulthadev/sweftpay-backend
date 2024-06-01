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
  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.error("Error Sending email", err);
    } else {
      console.log("OTP email sent successfully");
    }
  });
};

// To resend otp to the mail
const resendOTP = async (email) => {
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
    await sendEmail(email, newOTP);
  } catch (err) {
    console.error("Error resending OTP:", err);
    // Handle the error appropriately
  }
};

module.exports = { generateOTP, sendEmail, resendOTP };
