const nodemailer = require("nodemailer");
const crypto = require("crypto");
const config = require("../config/variables");
const emailTemplate = require("./emailTemplate");

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

module.exports = { generateOTP, sendEmail };
