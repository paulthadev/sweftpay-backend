const mongoose = require("mongoose");
const UserModel = require("./User");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: UserModel,
    },
    status: {
      type: String,
      enum: ["successful", "failed", "pending"],
      default: "pending",
    },
    amount: {
      type: mongoose.Schema.Types.Number,
    },
    source: {
      type: String,
    },
    serviceId: {
      type: String
    },
    beneficiary: {
      type: String
    },
    reference: {
      type: String,
    },
    externalReference: {
      type: String,
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

transactionSchema.index({ reference: 1 });
transactionSchema.index({ status: 1 });

module.exports = mongoose.model("Transactions", transactionSchema);
