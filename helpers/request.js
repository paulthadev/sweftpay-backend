const handleResponse = require("./response");

const handleRequest = async (req, res, next) => {
  try {
    if (!["POST", "PUT", "PATCH"].includes(req.method)) return next();

    let requestBody = { ...req.body, ...req.query };

    if (requestBody.password) delete requestBody.password;
    if (requestBody.confirmPassword) delete requestBody.confirmPassword;
    if (requestBody.oldPassword) delete requestBody.oldPassword;
    if (requestBody.newPassword) delete requestBody.newPassword;

    // TODO: Log request

    return next();
  } catch (error) {
    return handleResponse(req, res, { error: error?.message }, 500);
  }
};

module.exports = handleRequest;
