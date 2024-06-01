const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Wallet = require("../models/Wallet");
const jwt = require("jsonwebtoken");
const config = require("../config/variables");
const MonnifyService = require("../services/monnify.service");
const { generateOTP, sendEmail } = require("../utils/otp");
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

      //hash the passsword
      let passwordHashed = bcrypt.hashSync(password, 10);
      let otp = generateOTP();
      //create user
      let newUserPayload = {
        email: email.toLowerCase(),
        name,
        password: passwordHashed,
        otp: otp,
        otpExpires: Date.now() + 3600000,
      };

      const newUser = await User.create(newUserPayload);
      sendEmail(email.toLowerCase(), otp);
      // TODO: send email verification link to email

      return {
        status: "success",
        message: "User registration successful",
        data: { data: newUserPayload },
      };
    } catch (error) {
      console.log(error);
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
          message: "User does not exist or OTP has expired",
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
        return {
          status: "failed",
          message: "Please verify your account",
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
      userExists.save();

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
