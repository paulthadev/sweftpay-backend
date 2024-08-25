const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    emailVerified: {
      type: mongoose.Schema.Types.Boolean,
      default: false,
    },
    accessToken: {
      type: String,
    },
    isActive: {
      type: mongoose.Schema.Types.Boolean,
      default: true,
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    profileImage: {
      type: String,
    },
    profileImagePublicId: {
      type: String,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
      },
    },
  }
);

module.exports = mongoose.model("Users", userSchema);
