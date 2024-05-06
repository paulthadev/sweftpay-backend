const handleResponse = async (req, res, payload, statusCode) => {
  try {
    //TODO: Log response
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

module.exports = handleResponse