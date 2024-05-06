const mongoose = require('mongoose');
const UserModel = require("./User")

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: UserModel
    },
    balance: {
      type: mongoose.Schema.Types.Number,
      default: 0
    },

  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
      },
    }
  }
);

module.exports = mongoose.model('Wallets', walletSchema);
