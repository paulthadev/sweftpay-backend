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

  // New methods
  // delete account
  deleteAccount = async (payload) => {
    try {
      const { _id } = payload;

      await User.findByIdAndDelete(_id);
      await Wallet.findOneAndDelete({ user: _id });

      return {
        status: "success",
        message: "Account deleted successfully",
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "An unexpected error occurred, try again later",
      };
    }
  };

  // update profile
  updateProfile = async (payload, profileData) => {
    try {
      const { _id } = payload;

      const updatedUser = await User.findByIdAndUpdate(_id, profileData, {
        new: true,
      }).select("-password -__v -accessToken -otp -otpExpires");

      return {
        status: "success",
        message: "Profile updated successfully",
        data: { user: updatedUser },
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "An unexpected error occurred, try again later",
      };
    }
  };

  // change password
  changePassword = async (payload, currentPassword, newPassword) => {
    try {
      const { _id } = payload;

      const user = await User.findById(_id);

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return {
          status: "failed",
          message: "Current password is incorrect",
        };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      return {
        status: "success",
        message: "Password changed successfully",
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
