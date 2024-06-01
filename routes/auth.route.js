const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authValidator = require("../validators/auth.validator");

const { resendOTP } = require("../utils/otp"); // Replace with the actual path

// User registration
router.post("/register", authValidator.register, authController.register);

// User verify email
router.post(
  "/verify-email",
  authValidator.verifyEmail,
  authController.verifyEmail
);

// User login
router.post("/login", authValidator.login, authController.login);

// Resend OTP route
router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;
  try {
    await resendOTP(email);
    return res.status(200).json({ message: "OTP resent successfully" });
  } catch (err) {
    console.error("Error resending OTP:", err);
    return res.status(500).json({ message: "Failed to resend OTP" });
  }
});

module.exports = router;
