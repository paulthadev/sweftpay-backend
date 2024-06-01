const nodemailer = require("nodemailer");
const crypto = require("crypto");
const config = require("../config/variables");

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const sendEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: "server330.web-hosting.com",
    port: 465,
    secure: true,
    auth: {
      user: config.EMAIL,
      pass: config.PASS,
    },
  });
  const mailOptions = {
    to: email,
    from: config.EMAIL,
    subject: "SweftPay Account Registration OTP",
    text: `Your OTP for your account registration is: ${otp}\nIt is valid for 10 minutes`,
  };
  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.error("Error Sending email", err);
    } else {
      console.log("OTP email sent successfully");
    }
  });
};

module.exports = { generateOTP, sendEmail };
