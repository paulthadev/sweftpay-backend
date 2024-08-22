const crypto = require("crypto");
const AuthService = require("../services/auth.service");
const { resendOTP } = require("../utils/otp");
const User = require("../models/User");
const sendEmail = require("../utils/email");
const handleResponse = require("../helpers/response");
const logger = require("../utils/logger");

class AuthController {
  register = async (req, res) => {
    try {
      const response = await AuthService.register(req.body);
      const { status, data, message } = response;

      return handleResponse(
        req,
        res,
        { message: message, data },
        status == "success" ? 200 : 400
      );
    } catch (error) {
      logger.error("Error in registration:", error);
      return handleResponse(req, res, { message: error.message }, 500);
    }
  };

  verifyEmail = async (req, res) => {
    try {
      const response = await AuthService.verifyEmail(req.body);
      const { status, data, message } = response;

      return handleResponse(
        req,
        res,
        { message: message, data },
        status == "success" ? 200 : 400
      );
    } catch (error) {
      logger.error("Error in email verification:", error);
      return handleResponse(req, res, { message: error.message }, 500);
    }
  };

  login = async (req, res) => {
    try {
      const response = await AuthService.login(req.body);
      const { status, data, message } = response;

      return handleResponse(
        req,
        res,
        { message: message, data },
        status == "success" ? 200 : 400
      );
    } catch (error) {
      logger.error("Error in login:", error);
      return handleResponse(req, res, { message: error.message }, 500);
    }
  };

  resendOTPController = async (req, res) => {
    const { email } = req.body;

    const result = await resendOTP(email);

    if (result.error) {
      const { error: errorMessage } = result;
      const statusCode = handleResendOTPError(errorMessage);
      return res.status(statusCode).json({ message: errorMessage });
    }

    return res
      .status(200)
      .json({ success: true, message: "OTP resent successfully" });
  };

  forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return handleResponse(req, res, { message: "User not found" }, 404);
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(20).toString("hex");
      user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes

      await user.save();

      // Create reset URL
      const resetUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/auth/reset-password/${resetToken}`;

      const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please use the following link to reset your password: \n\n ${resetUrl}`;

      try {
        await sendEmail({
          email: user.email,
          subject: "Password Reset Request",
          message,
        });

        return handleResponse(
          req,
          res,
          { message: "Password reset email sent" },
          200
        );
      } catch (err) {
        console.error("Error sending password reset email:", err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        return handleResponse(
          req,
          res,
          { message: "Email could not be sent" },
          500
        );
      }
    } catch (error) {
      console.error("Error in forgot password:", error);
      return handleResponse(req, res, { message: "Server error" }, 500);
    }
  };
}

// Helper function to handle resend OTP errors
const handleResendOTPError = (errorMessage) => {
  switch (errorMessage) {
    case "User not found":
      return 404;
    case "Failed to send email":
      return 500;
    case "Email already verified":
      return 400; // Return a 400 Bad Request status code
    default:
      return 500;
  }
};
module.exports = new AuthController();
