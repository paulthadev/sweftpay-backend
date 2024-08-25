const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

// user profile
router.get(
  "/profile",
  authMiddleware.ValidateBearerToken,
  authMiddleware.ValidateUserStatus,
  userController.userProfile
);

// User wallet balance
router.get(
  "/wallet",
  authMiddleware.ValidateBearerToken,
  authMiddleware.ValidateUserStatus,
  userController.wallet
);

// New routes
// delete account
router.delete(
  "/delete-account",
  authMiddleware.ValidateBearerToken,
  authMiddleware.ValidateUserStatus,
  userController.deleteAccount
);

// update profile
router.put(
  "/update-profile",
  authMiddleware.ValidateBearerToken,
  authMiddleware.ValidateUserStatus,
  (req, res, next) => {
    upload.single("profileImage")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  userController.updateProfile
);

// change password
router.put(
  "/change-password",
  authMiddleware.ValidateBearerToken,
  authMiddleware.ValidateUserStatus,
  userController.changePassword
);

module.exports = router;
