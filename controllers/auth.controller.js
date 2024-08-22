const User = require("../models/User");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const AuthService = require("../services/auth.service");
const handleResponse = require("../helpers/response");
const logger = require("../utils/logger");
const { resendOTP } = require("../utils/otp");
const { sendEmail } = require("../utils/otp");
const { passwordResetTemplate } = require("../utils/emailTemplate");

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
      )}/api/auth/reset-password/${resetToken}`;

      // Generate email content using the template
      const emailContent = passwordResetTemplate(resetUrl);

      try {
        const emailResult = await sendEmail(
          user.email,
          "SweftPay Password Reset",
          emailContent
        );
        if (emailResult.error) {
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

  getResetPassword = async (req, res) => {
    // This method is optional, used if you want to validate the token before showing the reset form
    const { token } = req.params;

    // You might want to check if the token is valid here
    // For now, we'll just return a success message
    return handleResponse(req, res, { message: "Token is valid" }, 200);
  };

  resetPassword = async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      // Find user by token
      const user = await User.findOne({
        resetPasswordToken: crypto
          .createHash("sha256")
          .update(token)
          .digest("hex"),
        resetPasswordExpire: { $gt: Date.now() },
      });

      if (!user) {
        return handleResponse(
          req,
          res,
          { message: "Invalid or expired token" },
          400
        );
      }

      // Set new password
      user.password = await bcrypt.hash(password, 10);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return handleResponse(
        req,
        res,
        { message: "Password reset successful" },
        200
      );
    } catch (error) {
      console.error("Error in reset password:", error);
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
