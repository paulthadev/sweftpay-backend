const User = require("../models/User");
const Wallet = require("../models/Wallet");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const {
  CLOUDINARY_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = require("../config/variables");

cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

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

      // Check if there's anything to update
      if (Object.keys(profileData).length === 0) {
        return {
          status: "failed",
          message: "No updates provided",
        };
      }

      // Validate input data
      const allowedUpdates = ["name", "email", "profileImage"]; // Add other allowed fields
      const isValidOperation = Object.keys(profileData).every((update) =>
        allowedUpdates.includes(update)
      );
      if (!isValidOperation) {
        return {
          status: "failed",
          message: "Invalid updates!",
        };
      }

      // Find the existing user
      const user = await User.findById(_id);
      if (!user) {
        return {
          status: "failed",
          message: "User not found",
        };
      }

      // If there's a new profile image, delete the old one and upload the new one
      if (profileData.profileImage) {
        if (user.profileImagePublicId) {
          // Delete the old image from Cloudinary
          await cloudinary.uploader.destroy(user.profileImagePublicId);
        }

        // Upload the new image and get its public_id
        const uploadResult = await cloudinary.uploader.upload(
          profileData.profileImage
        );
        profileData.profileImage = uploadResult.secure_url;
        profileData.profileImagePublicId = uploadResult.public_id;
      }

      // Update the user profile
      const updatedUser = await User.findByIdAndUpdate(_id, profileData, {
        new: true,
        runValidators: true,
      }).select("-password -__v -accessToken -otp -otpExpires");

      if (!updatedUser) {
        return {
          status: "failed",
          message: "User not found",
        };
      }

      console.log(`Profile updated successfully for user ID: ${_id}`);
      return {
        status: "success",
        message: "Profile updated successfully",
        data: { user: updatedUser },
      };
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.name === "ValidationError") {
        return {
          status: "failed",
          message: "Validation error: " + error.message,
        };
      }
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
      if (!user) {
        return {
          status: "failed",
          message: "User not found",
        };
      }

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
      console.error("Change password service error:", error);
      return {
        status: "failed",
        message: "An unexpected error occurred, try again later",
      };
    }
  };
}

module.exports = new UserService();
