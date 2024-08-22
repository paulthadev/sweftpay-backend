const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authValidator = require("../validators/auth.validator");

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
router.post(
  "/resend-otp",
  authValidator.validateResendOTPRequest,
  authController.resendOTPController
);

// forget password
router.post("/forgot-password", authController.forgotPassword);

// forget password with tokens
router.get("/reset-password/:token", authController.getResetPassword);
router.post("/reset-password/:token", authController.resetPassword);

module.exports = router;
