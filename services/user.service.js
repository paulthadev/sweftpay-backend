const User = require("../models/User");
const Wallet = require("../models/Wallet");

class UserService {
  userProfile = async (payload) => {
    try {
      const { _id } = payload;

      const user = await User.findOne({ _id }).select(
        "-password -__v -accessToken"
      );

      return {
        status: "success",
        message: "User profile retrieved successfully",
        data: { user },
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "An unexpected error occurred, try again later",
      };
    }
  };

  wallet = async (payload) => {
    try {
      const { _id } = payload;

      const wallet = await Wallet.findOne({ user: _id });

      return {
        status: "success",
        message: "wallet balance retrieved successfully",
        data: { wallet },
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

module.exports = new UserService();
