const Wallet = require("../models/Wallet");
const WalletAudit = require("../models/WalletAudit");
const Transactions  = require("../models/Transaction")
const MonnifyService = require("../services/monnify.service")
const BillService = require("./bill.service")
const { v4: uuidv4 } = require("uuid");
const WalletUtils = require("../utils/wallet")

class PaymentService {
  payBill = async (payload) => {
    try {
      return {
        status: "success",
        message: "Bill payment successful",
        data: {},
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "An unexpected error occurred, try again later",
      };
    }
  };

  buyAirtime = async (payload) => {
    try {
      const { user, data } = payload;
      const { amount, phone, serviceId } = data;

      const walletCheckRes = await WalletUtils.checkForSufficientWallet({
        userId: user._id,
        amount: Number(amount),
      });

      if (walletCheckRes.status == "failed") {
        return {
          status: "failed",
          message: walletCheckRes?.message || "Request failed",
        };
      }

      const reference = uuidv4();

      const billServiceRes = await BillService.buyAirtime({
        ...data,
        reference,
      });

      if (billServiceRes.status === "failed") {
        return {
          status: "failed",
          message: "Request failed, try again later!",
        };
      }

      if (billServiceRes.status === "success") {
        //wallet debit
        const walletDebitRes = await WalletUtils.debitWallet({
          userId: user._id,
          amount: Number(amount),
          source: "bill-payment",
        });

        if (walletDebitRes.status == "failed") {
          return {
            status: "failed",
            message: walletDebitRes?.message || "failed to debit wallet",
          };
        }

        Transactions.create({
          user: user._id,
          status: "successful",
          amount: Number(amount),
          source: `bill-payment`,
          serviceId,
          beneficiary: phone,
          reference,
          externalReference: billServiceRes.data?.transactionId?.toString(),
        });
      }
      return {
        status: "success",
        message: "Airtime purchase successful",
        data: billServiceRes?.data || {},
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "An unexpected error occurred, try again later",
      };
    }
  };

  getVariationCodes = async (payload) => {
    try {
      const { user, data } = payload;
      const { serviceId } = data;

      const billServiceRes = await BillService.getDataVariationCodes({
        ...data,
      });

      if (billServiceRes.status === "failed") {
        return {
          status: "failed",
          message: "Request failed, try again later!",
        };
      }

      return {
        status: "success",
        message: "Variation codes retrieved successfully",
        data: billServiceRes?.data || {},
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "An unexpected error occurred, try again later",
      };
    }
  };

  buyData = async (payload) => {
    try {
      const { user, data } = payload;
      const { amount, phone, serviceId, billersCode, variationCode, quantity } =
        data;

      const walletCheckRes = await WalletUtils.checkForSufficientWallet({
        userId: user._id,
        amount: Number(amount),
      });

      if (walletCheckRes.status == "failed") {
        return {
          status: "failed",
          message: walletCheckRes?.message || "Request failed",
        };
      }

      const reference = uuidv4();

      const billServiceRes = await BillService.buyAirtime({
        ...data,
        reference,
      });

      if (billServiceRes.status === "failed") {
        return {
          status: "failed",
          message: "Request failed, try again later!",
        };
      }

      if (billServiceRes.status === "success") {
        //wallet debit
        const walletDebitRes = await WalletUtils.debitWallet({
          userId: user._id,
          amount: Number(amount),
          source: "bill-payment",
        });

        if (walletDebitRes.status == "failed") {
          return {
            status: "failed",
            message: walletDebitRes?.message || "failed to debit wallet",
          };
        }

        Transactions.create({
          user: user._id,
          status: "successful",
          amount: Number(amount),
          source: `bill-payment`,
          serviceId,
          beneficiary: phone,
          reference,
          externalReference: billServiceRes.data?.transactionId?.toString(),
        });
      }
      return {
        status: "success",
        message: "Data subscription purchase successful",
        data: billServiceRes?.data || {},
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "An unexpected error occurred, try again later",
      };
    }
  };

  verifySmileEmail = async (payload) => {
    try {
      const { user, data } = payload;
      const { serviceId, billersCode } = data;

      const billServiceRes = await BillService.verifySmileEmail({
        ...data,
      });

      if (billServiceRes.status === "failed") {
        return {
          status: "failed",
          message: "Request failed, try again later!",
        };
      }

      return {
        status: "success",
        message: "Email verified successfully",
        data: billServiceRes?.data || {},
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "An unexpected error occurred, try again later",
      };
    }
  };

  payTvSubscription = async (payload) => {
    try {
      const { user, data } = payload;
      const {
        amount,
        phone,
        serviceId,
        billersCode,
        variationCode,
        quantity,
        subscriptionType,
      } = data;

      const walletCheckRes = await WalletUtils.checkForSufficientWallet({
        userId: user._id,
        amount: Number(amount),
      });

      if (walletCheckRes.status == "failed") {
        return {
          status: "failed",
          message: walletCheckRes?.message || "Request failed",
        };
      }

      const reference = uuidv4();

      const billServiceRes = await BillService.payTVSubscription({
        ...data,
        reference,
      });

      if (billServiceRes.status === "failed") {
        return {
          status: "failed",
          message: "Request failed, try again later!",
        };
      }

      if (billServiceRes.status === "success") {
        //wallet debit
        const walletDebitRes = await WalletUtils.debitWallet({
          userId: user._id,
          amount: Number(amount),
          source: "bill-payment",
        });

        if (walletDebitRes.status == "failed") {
          return {
            status: "failed",
            message: walletDebitRes?.message || "failed to debit wallet",
          };
        }

        Transactions.create({
          user: user._id,
          status: "successful",
          amount: Number(amount),
          source: `bill-payment`,
          serviceId,
          beneficiary: phone,
          reference,
          externalReference: billServiceRes.data?.transactionId?.toString(),
        });
      }
      return {
        status: "success",
        message: "TV subscription purchase successful",
        data: billServiceRes?.data || {},
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "An unexpected error occurred, try again later",
      };
    }
  };

  verifySmartCardNumber = async (payload) => {
    try {
      const { user, data } = payload;
      const { serviceId, billersCode } = data;

      const billServiceRes = await BillService.verifySmileEmail({
        ...data,
      });

      if (billServiceRes.status === "failed") {
        return {
          status: "failed",
          message: "Request failed, try again later!",
        };
      }

      return {
        status: "success",
        message: "Smart card verified successfully",
        data: billServiceRes?.data || {},
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "An unexpected error occurred, try again later",
      };
    }
  };

  payElectricityBill = async (payload) => {
    try {
      const { user, data } = payload;
      const {
        amount,
        phone,
        serviceId,
        billersCode,
        variationCode,
        quantity,
        subscriptionType,
      } = data;

      const walletCheckRes = await WalletUtils.checkForSufficientWallet({
        userId: user._id,
        amount: Number(amount),
      });

      if (walletCheckRes.status == "failed") {
        return {
          status: "failed",
          message: walletCheckRes?.message || "Request failed",
        };
      }

      const reference = uuidv4();

      const billServiceRes = await BillService.payElectricityBill({
        ...data,
        reference,
      });

      if (billServiceRes.status === "failed") {
        return {
          status: "failed",
          message: "Request failed, try again later!",
        };
      }

      if (billServiceRes.status === "success") {
        //wallet debit
        const walletDebitRes = await WalletUtils.debitWallet({
          userId: user._id,
          amount: Number(amount),
          source: "bill-payment",
        });

        if (walletDebitRes.status == "failed") {
          return {
            status: "failed",
            message: walletDebitRes?.message || "failed to debit wallet",
          };
        }

        Transactions.create({
          user: user._id,
          status: "successful",
          amount: Number(amount),
          source: `bill-payment`,
          serviceId,
          beneficiary: phone,
          reference,
          externalReference: billServiceRes.data?.transactionId?.toString(),
        });
      }
      return {
        status: "success",
        message: "Electricity bill purchase successful",
        data: billServiceRes?.data || {},
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "An unexpected error occurred, try again later",
      };
    }
  };

  verifyMeterNumber = async (payload) => {
    try {
      const { user, data } = payload;
      const { serviceId, billersCode, type } = data;

      const billServiceRes = await BillService.verifyMeterNumber({
        ...data,
      });

      if (billServiceRes.status === "failed") {
        return {
          status: "failed",
          message: "Request failed, try again later!",
        };
      }

      return {
        status: "success",
        message: "Meter number verified successfully",
        data: billServiceRes?.data || {},
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "An unexpected error occurred, try again later",
      };
    }
  };

  payEducationalBill = async (payload) => {
    try {
      const { user, data } = payload;
      const {
        amount,
        phone,
        serviceId,
        billersCode,
        variationCode,
        quantity
      } = data;

      const walletCheckRes = await WalletUtils.checkForSufficientWallet({
        userId: user._id,
        amount: Number(amount),
      });

      if (walletCheckRes.status == "failed") {
        return {
          status: "failed",
          message: walletCheckRes?.message || "Request failed",
        };
      }

      const reference = uuidv4();

      const billServiceRes = await BillService.payEducationalBill({
        ...data,
        reference,
      });

      if (billServiceRes.status === "failed") {
        return {
          status: "failed",
          message: "Request failed, try again later!",
        };
      }

      if (billServiceRes.status === "success") {
        //wallet debit
        const walletDebitRes = await WalletUtils.debitWallet({
          userId: user._id,
          amount: Number(amount),
          source: "bill-payment",
        });

        if (walletDebitRes.status == "failed") {
          return {
            status: "failed",
            message: walletDebitRes?.message || "failed to debit wallet",
          };
        }

        Transactions.create({
          user: user._id,
          status: "successful",
          amount: Number(amount),
          source: `bill-payment`,
          serviceId,
          beneficiary: phone,
          reference,
          externalReference: billServiceRes.data?.transactionId?.toString(),
        });
      }
      return {
        status: "success",
        message: "Educational bill purchase successful",
        data: billServiceRes?.data || {},
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "An unexpected error occurred, try again later",
      };
    }
  };

  verifyProfileId = async (payload) => {
    try {
      const { user, data } = payload;
      const { serviceId, billersCode, type } = data;

      const billServiceRes = await BillService.verifyProfileId({
        ...data,
      });

      if (billServiceRes.status === "failed") {
        return {
          status: "failed",
          message: "Request failed, try again later!",
        };
      }

      return {
        status: "success",
        message: "Profile Id verified successfully",
        data: billServiceRes?.data || {},
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "An unexpected error occurred, try again later",
      };
    }
  };

  reQueryTransaction = async (payload) => {
    try {
      const { user, data } = payload;
      const { requestId } = data;

      const billServiceRes = await BillService.reQueryTransaction({
        ...data,
      });

      if (billServiceRes.status === "failed") {
        return {
          status: "failed",
          message: "Request failed, try again later!",
        };
      }

      return {
        status: "success",
        message: "Profile Id verified successfully",
        data: billServiceRes?.data || {},
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "An unexpected error occurred, try again later",
      };
    }
  };

  checkTransactions = async (payload) => {
    try {
      const { userId, status, page, perPage, source, serviceId, beneficiary } =
        payload;

      const query = {};
      if (userId) query["user"] = userId;
      if (status) query["status"] = status.toLowerCase();
      if (source) query["source"] = source.toLowerCase();
      if (serviceId) query["serviceId"] = new RegExp(`${serviceId}`, "i");
      if (beneficiary) query["beneficiary"] = beneficiary;

      let pageNumber, limit;
      if (page) {
        pageNumber = Number(page);
      } else {
        pageNumber = 1;
      }

      if (perPage) {
        limit = Number(perPage);
      } else {
        limit = 20;
      }

      const offset = Number(limit) * (Number(pageNumber) - 1);

      const [total, transactions] = await Promise.all([
        Transactions.countDocuments(query),
        Transactions.find(query)
          .limit(limit)
          .skip(offset)
          .sort({ createdAt: -1 }),
      ]);

      return {
        status: "success",
        message: "Transactions retrieved successfully",
        data: { transactions, total },
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "An unexpected error occurred, try again later",
      };
    }
  };

  checkWalletBalance = async (payload) => {
    try {
      const { userId } = payload;
      const walletExists = await Wallet.findOne({ user: userId });

      if (!walletExists) {
        return {
          status: "failed",
          message: "No wallet was found for this user",
        };
      }
      return {
        status: "success",
        message: "Wallet retrieved successfully",
        data: { wallet: walletExists },
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "An unexpected error occurred, try again later",
      };
    }
  };

  initializeDepositViaMonnify = async (payload) => {
    try {
      const { _id, name, email, amount } = payload;

      const reservedAccounts = await MonnifyService.saveReservedAccount({
        _id,
        name,
        email,
      });

      if (reservedAccounts.status === "failed") {
        return {
          status: "failed",
          message: "Request failed, try again later",
        };
      }

      return {
        status: "success",
        message: `Deposit initialized successfully. Make a transfer of ${amount} into any of the accounts`,
        data: { accounts: reservedAccounts?.data?.accounts },
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "An unexpected error occurred, try again later",
      };
    }
  };
}

module.exports = new PaymentService();
