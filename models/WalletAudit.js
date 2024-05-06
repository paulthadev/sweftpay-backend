const mongoose = require('mongoose');
const UserModel = require("./User")

const walletAuditSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: UserModel
    },
    transactionType: {
     type: String,
     enum: ["DEBIT", "CREDIT"]
    },
    transactionAmount: {
     type: mongoose.Schema.Types.Number,
   },
   source: {
    type: String,
   },
    prevBalance: {
      type: mongoose.Schema.Types.Number,
      default: 0
    },
    currentBalance: {
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

walletAuditSchema.index({source:  1})
walletAuditSchema.index({user:  1})

module.exports = mongoose.model('WalletAudits', walletAuditSchema);
