const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGODB_URL: process.env.MONGODB_URL || "mongodb://localhost:27017/john-vtu",
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || "secretkeyforjohnvtu",
  LOGIN_EXPIRES_IN: process.env.LOGIN_EXPIRES_IN,
  MONNIFY_API_KEY: process.env.MONNIFY_API_KEY,
  MONNIFY_SECRET_KEY: process.env.MONNIFY_SECRET_KEY,
  MONNIFY_BASE_URL: process.env.MONNIFY_BASE_URL,
  MONNIFY_WALLET_ACCOUNT: process.env.MONNIFY_WALLET_ACCOUNT,
  MONNIFY_CONTRACT_CODE: process.env.MONNIFY_CONTRACT_CODE,
  VT_PASS_SECRET_KEY: process.env.VT_PASS_SECRET_KEY,
  VT_PASS_PUBLIC_KEY: process.env.VT_PASS_PUBLIC_KEY,
  VT_PASS_API_KEY: process.env.VT_PASS_API_KEY,
  VT_PASS_BASE_URL: process.env.VT_PASS_BASE_URL,
  VT_PASS_USERNAME: process.env.VT_PASS_USERNAME,
  VT_PASS_PASSWORD: process.env.VT_PASS_PASSWORD,
  EMAIL: process.env.EMAIL,
  PASS: process.env.PASS
};
