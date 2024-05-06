const handleResponse = require("../helpers/response");
const AuthService = require("../services/auth.service");

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
      console.log(error);
      return handleResponse(
        req,
        res,
        { message: "An unexpected error occurred" },
        500
      );
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
      console.log(error);
      return handleResponse(
        req,
        res,
        { message: "An unexpected error occurred" },
        500
      );
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
      console.log(error);
      return handleResponse(
        req,
        res,
        { message: "An unexpected error occurred" },
        500
      );
    }
  };
}

module.exports = new AuthController();
