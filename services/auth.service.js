const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Wallet = require("../models/Wallet");
const jwt = require("jsonwebtoken");
const config = require("../config/variables");
const MonnifyService = require("../services/monnify.service");
const { generateOTP, sendEmail } = require("../utils/otp");
const {
  verificationOTPTemplate,
  registrationOTPTemplate,
} = require("../utils/emailTemplate");
class AuthService {
  register = async (payload) => {
    try {
      const { email, name, password } = payload;

      const userExists = await User.findOne({ email: email.toLowerCase() });

      if (userExists) {
        return {
          status: "failed",
          message: "User with the same email exists already",
        };
      }

      //hash the password
      let passwordHashed = bcrypt.hashSync(password, 10);
      let otp = generateOTP();
      //create user
      let newUserPayload = {
        email: email.toLowerCase(),
        name,
        password: passwordHashed,
        otp: otp,
        otpExpires: Date.now() + 600000, // 10 minutes
      };

      const newUser = await User.create(newUserPayload);

      // Generate OTP email content
      const emailContent = registrationOTPTemplate(otp);

      // Send email
      const emailResult = await sendEmail(
        email.toLowerCase(),
        "SweftPay registration OTP",
        emailContent
      );

      if (emailResult.error) {
        console.error("Failed to send OTP email:", emailResult.error);
        // You might want to handle this error, perhaps by deleting the newly created user
        await User.findByIdAndDelete(newUser._id);
        return {
          status: "failed",
          message:
            "User created but failed to send verification email. Please try again.",
        };
      }

      return {
        status: "success",
        message:
          "User registration successful. Please check your email for the verification code.",
        data: { email: newUserPayload.email, name: newUserPayload.name },
      };
    } catch (error) {
      console.error("Error in registration:", error);
      return {
        status: "failed",
        message: "An unexpected error occurred, try again later",
      };
    }
  };

  verifyEmail = async (payload) => {
    try {
      const { otp } = payload;
      const currentTime = Date.now();

      const userExists = await User.findOne({
        otp,
        otpExpires: { $gt: currentTime },
      });

      if (!userExists) {
        return {
          status: "failed",
          message: "Invalid OTP or OTP has expired",
        };
      }

      if (userExists.emailVerified) {
        return {
          status: "failed",
          message: "email has already been verified",
        };
      }

      await User.updateOne({ _id: userExists._id }, { emailVerified: true });

      //create user wallet
      const userWalletExists = await Wallet.findOne({ user: userExists._id });

      if (!userWalletExists) {
        Wallet.create({ user: userExists._id });
      }

      // generate virtual account
      MonnifyService.saveReservedAccount({
        name: userExists.name,
        email: userExists.email,
        _id: userExists._id,
      });

      return {
        status: "success",
        message: "Email verification successful",
        data: {},
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "An unexpected error occurred, try again later",
      };
    }
  };

  login = async (payload) => {
    try {
      const { email, password } = payload;

      const userExists = await User.findOne({ email: email.toLowerCase() });

      if (!userExists) {
        return {
          status: "failed",
          message: "Account does not exist",
        };
      }

      //compare password
      const isPasswordValid = bcrypt.compareSync(password, userExists.password);

      if (!isPasswordValid) {
        return {
          status: "failed",
          message: "Oops! You used the wrong credentials",
        };
      }

      //check if user is verified
      if (!userExists.emailVerified) {
        // Generate new OTP
        const newOTP = generateOTP();
        userExists.otp = newOTP;
        userExists.otpExpires = Date.now() + 600000; // 10 minutes
        await userExists.save();

        // Send verification OTP
        const emailContent = verificationOTPTemplate(newOTP);
        await sendEmail(
          userExists.email,
          "SweftPay Account Verification OTP",
          emailContent
        );

        return {
          status: "failed",
          message:
            "Please verify your account. A new OTP has been sent to your email.",
        };
      }

      //generate token
      const tokenPayload = {
        id: userExists._id,
        email: userExists.email,
        type: "LOGIN_TOKEN",
      };
      const token = jwt.sign(tokenPayload, config.JWT_SECRET_KEY, {
        expiresIn: config.LOGIN_EXPIRES_IN || "24h",
      });

      userExists.accessToken = token;
      await userExists.save();

      const [user, wallet] = await Promise.all([
        User.findOne({ _id: userExists._id }).select(
          "-password -__v -accessToken"
        ),
        Wallet.findOne({ user: userExists._id }),
      ]);

      return {
        status: "success",
        message: "User login successful",
        data: { user, token, wallet },
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "An unexpected error occurred, try again later",
      };
    }
  };
}

module.exports = new AuthService();
