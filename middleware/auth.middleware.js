const handleResponse = require("../helpers/response");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const config = require("../config/variables");

class AuthMiddleware {
  ValidateUserStatus = async (req, res, next) => {
    const user = req.user;
    if (!user.isActive) {
      return handleResponse(
        req,
        res,
        {
          message: `Your account is not active. Please contact customer support.`,
        },
        400
      );
    }

    return next();
  };

  ValidateBearerToken = async (req, res, next) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token)
      return handleResponse(
        req,
        res,
        {
          message: "Invalid token!",
        },
        401
      );

    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET_KEY);
      if (!decoded || decoded.type !== "LOGIN_TOKEN")
        return handleResponse(
          req,
          res,
          {
            message:
              "Invalid token or token has expired! Please log out and login again",
          },
          401
        );
    } catch (error) {
      return handleResponse(
        req,
        res,
        {
          message:
            "Invalid token or token has expired! Please log out and login again",
        },
        401
      );
    }

    const user = await User.findOne({
      _id: decoded.id,
      accessToken: token,
    }).select("-password -accessToken");

    if (!user)
      return handleResponse(
        req,
        res,
        {
          message:
            "Invalid token or token has expired! Please log out and login again",
        },
        401
      );
    let stringifyUser = JSON.stringify(user)
    let parsedUser = JSON.parse(stringifyUser)
    req.user = parsedUser;
    return next();
  };
}

module.exports = new AuthMiddleware()
