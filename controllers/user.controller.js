const handleResponse = require("../helpers/response");
const UserService = require("../services/user.service");

class UserController {
  userProfile = async (req, res) => {
    try {
      // perform user profile logic
      const response = await UserService.userProfile(req.user);
      const { status, data, message } = response;

      return handleResponse(
        req,
        res,
        { message: message, data },
        status == "success" ? 200 : 400
      );
    } catch (error) {
      console.log(error);
      return handleResponse(
        req,
        res,
        { message: "An unexpected error occurred" },
        500
      );
    }
  };

  wallet = async (req, res) => {
    try {
      //perform wallet logic
      const response = await UserService.wallet(req.user);
      const { status, data, message } = response;

      return handleResponse(
        req,
        res,
        { message: message, data },
        status == "success" ? 200 : 400
      );
    } catch (error) {
      console.log(error);
      return handleResponse(
        req,
        res,
        { message: "An unexpected error occurred" },
        500
      );
    }
  };

  // New methods

  deleteAccount = async (req, res) => {
    try {
      const response = await UserService.deleteAccount(req.user);
      const { status, message } = response;

      return handleResponse(
        req,
        res,
        { message: message },
        status === "success" ? 200 : 400
      );
    } catch (error) {
      console.log(error);
      return handleResponse(
        req,
        res,
        { message: "An unexpected error occurred" },
        500
      );
    }
  };

  updateProfile = async (req, res) => {
    try {
      const profileData = {
        ...req.body,
        profileImage: req.file ? req.file.path : undefined,
      };
      const response = await UserService.updateProfile(req.user, profileData);
      const { status, data, message } = response;

      return handleResponse(
        req,
        res,
        { message: message, data },
        status === "success" ? 200 : 400
      );
    } catch (error) {
      console.log(error);
      return handleResponse(
        req,
        res,
        { message: "An unexpected error occurred" },
        500
      );
    }
  };

  changePassword = async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const response = await UserService.changePassword(
        req.user,
        currentPassword,
        newPassword
      );
      const { status, message } = response;

      return handleResponse(
        req,
        res,
        { message: message },
        status === "success" ? 200 : 400
      );
    } catch (error) {
      console.error("Change password error:", error);
      return handleResponse(
        req,
        res,
        { message: "An unexpected error occurred" },
        500
      );
    }
  };
}

module.exports = new UserController();
