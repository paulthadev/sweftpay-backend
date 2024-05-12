const logger = require("../utils/logger");

const handleResponse = async (req, res, payload, statusCode) => {
  try {
    const ipAddress =
      req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    let responseDataAsString = JSON.stringify(payload);

    logger(module).info(
      `${statusCode} - ${req.method} - ${ipAddress}- ${req.originalUrl} - ${
        statusCode >= 400 ? responseDataAsString : "success"
      }`
    );
    res.setHeader("Cache-control", "no-cache");
    res.setHeader("Pragma", "no-store");
    res.setHeader("X-XSS-Protection", "1; mode=block");

    return res.status(statusCode).json({
      data: payload,
      status: statusCode < 400 ? "success" : "error",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: { message: "An unexpected error occurred, try again later!" },
      status: "error",
    });
  }
};

module.exports = handleResponse;
