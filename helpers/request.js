const logger = require("../utils/logger");
const handleResponse = require("./response");

const handleRequest = async (req, res, next) => {
  try {

    let requestBody = { ...req.body, ...req.query };

    if (requestBody.password) delete requestBody.password;
    if (requestBody.confirmPassword) delete requestBody.confirmPassword;
    if (requestBody.oldPassword) delete requestBody.oldPassword;
    if (requestBody.newPassword) delete requestBody.newPassword;

    logger(module).info(`${req.method} - ${req.ip} - ${req.originalUrl} - ${JSON.stringify(requestBody)}`)

    return next();
  } catch (error) {
    return handleResponse(req, res, { error: error?.message }, 500);
  }
};

module.exports = handleRequest;
