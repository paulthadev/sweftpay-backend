const axios = require("axios");
const MonnifyAccessToken = require("../models/MonnifyAccessTokens");
const Log = require("../models/Log");
const moment = require("moment");
const config = require("../config/variables");
const MonnifyVirtualAccount = require("../models/MonnifyVirtualAccount");
const crypto = require("crypto");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
//const PaymentService = require("../services/payment.service");
const Webhook = require("../models/Webhook");
const WalletUtils = require("../utils/wallet");

class MonnifyService {
  authenticate = async () => {
    const url = `${config.MONNIFY_BASE_URL}/api/v1/auth/login`;

    const clientSecretId = Buffer.from(
      `${config.MONNIFY_API_KEY}:${config.MONNIFY_SECRET_KEY}`
    ).toString("base64");

    const headers = {
      Authorization: `Basic ${clientSecretId}`,
    };

    try {
      //check token first
      const tokenExists = await MonnifyAccessToken.findOne({}).sort({
        createdAt: -1,
      });

      if (tokenExists) {
        //check expiry date
        const timeNowInUnix = moment().unix();
        const expiryDateInUnix = moment(tokenExists.expiryDate).unix();

        if (expiryDateInUnix > timeNowInUnix) {
          return {
            status: "success",
            message: "token retrieved from cache",
            data: {
              token: tokenExists.token,
              expiresIn: tokenExists.expiresIn,
            },
          };
        }
      }

      //request
      let axiosConfig = {
        headers,
      };
      const { data } = await axios.post(url, null, axiosConfig);

      const { requestSuccessful, responseBody } = data;

      Log.create({
        service: "monnify",
        httpMethod: "post",
        url,
        request: null,
        headers: JSON.stringify(headers),
        response: JSON.stringify(data),
        status: requestSuccessful ? "success" : "failed",
      });

      const { accessToken, expiresIn } = responseBody;

      //store in cache
      const cachePayload = {
        token: accessToken,
        expiresIn,
        expiryDate: moment().add(Number(expiresIn), "seconds"),
      };

      MonnifyAccessToken.create(cachePayload);

      return {
        status: "success",
        message: "token refreshed from monnify",
        data: { token: accessToken, expiresIn },
      };
    } catch (error) {
      console.log(error);
      const errMsg = error.response?.data
        ? error.response?.data?.message
        : error.message;

      Log.create({
        service: "monnify",
        httpMethod: "post",
        url,
        request: null,
        headers: JSON.stringify(headers),
        response: error.response?.data
          ? JSON.stringify(error.response?.data)
          : errMsg,
        status: "failed",
      });

      return {
        status: "failed",
        message: "Request failed",
      };
    }
  };

  createReservedAccount = async (payload) => {
    const tokenData = await this.authenticate();
    if (tokenData.status === "failed") {
      return {
        status: "failed",
        message: "Request failed",
      };
    }

    const url = `${config.MONNIFY_BASE_URL}/api/v2/bank-transfer/reserved-accounts`;
    const headers = {
      Authorization: `Bearer ${tokenData.data.token}`,
    };

    const { name, _id, email } = payload;
    let requestPayload = {
      accountReference: _id,
      accountName: name,
      currencyCode: "NGN",
      contractCode: config.MONNIFY_CONTRACT_CODE,
      customerEmail: email,
      customerName: name,
      getAllAvailableBanks: true,
    };
    try {
      let axiosConfig = {
        headers,
      };
      const { data } = await axios.post(url, requestPayload, axiosConfig);

      const { requestSuccessful, responseBody } = data;

      Log.create({
        service: "monnify",
        httpMethod: "post",
        url,
        request: JSON.stringify(requestPayload),
        headers: JSON.stringify(headers),
        response: JSON.stringify(data),
        status: requestSuccessful ? "success" : "failed",
      });

      return {
        status: "success",
        message: "reserved account created successfully",
        data: responseBody,
      };
    } catch (error) {
      console.log(error);
      const errMsg = error.response?.data
        ? error.response?.data?.message
        : error.message;

      Log.create({
        service: "monnify",
        httpMethod: "post",
        url,
        request: JSON.stringify(requestPayload),
        headers: JSON.stringify(headers),
        response: error.response?.data
          ? JSON.stringify(error.response?.data)
          : errMsg,
        status: "failed",
      });
      return {
        status: "failed",
        message: "Request failed",
      };
    }
  };

  //internal
  saveReservedAccount = async (payload) => {
    const { name, email, _id } = payload;
    try {
      //check first
      const virtualAccountsExists = await MonnifyVirtualAccount.find({
        user: _id,
      }).select("-meta");

      if (virtualAccountsExists.length > 0) {
        return {
          status: "success",
          message: "Virtual accounts exist",
          data: { accounts: virtualAccountsExists },
        };
      }
      const reservedAccountData = await this.createReservedAccount(payload);

      if (reservedAccountData.status === "failed") {
        return {
          status: "failed",
          message: reservedAccountData.message,
        };
      }

      let savedReservedAccountData = [];

      if (reservedAccountData.data?.accounts?.length > 0) {
        let accounts = reservedAccountData.data.accounts;
        for (let account of accounts) {
          const accountExist = await MonnifyVirtualAccount.findOne({
            user: _id,
            accountNumber: account.accountNumber,
          });
          if (!accountExist) {
            let newVirtualAcctPayload = {
              user: _id,
              referenceNumber: _id,
              accountNumber: account?.accountNumber,
              bankCode: account?.bankCode,
              bankName: account.bankName,
              reservationReference:
                reservedAccountData.data?.reservationReference,
              meta: JSON.stringify(reservedAccountData.data),
            };
            const newVirtualAcct = await MonnifyVirtualAccount.create(
              newVirtualAcctPayload
            );

            if (newVirtualAcct) {
              newVirtualAcctPayload["meta"] = undefined;
              newVirtualAcctPayload[_id] = newVirtualAcct._id;
              savedReservedAccountData.push(newVirtualAcctPayload);
            }
          }
        }
      }
      return {
        status: "success",
        message: "Virtual accounts saved successfully",
        data: { accounts: savedReservedAccountData },
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "Request failed",
      };
    }
  };

  getReservedAccount = async (payload) => {
    const tokenData = await this.authenticate();
    if (tokenData.status === "failed") {
      return {
        status: "failed",
        message: "Request failed",
      };
    }

    const url = `${config.MONNIFY_BASE_URL}/api/v2/bank-transfer/reserved-accounts`;
    const headers = {
      Authorization: `Bearer ${tokenData.data.token}`,
    };

    const { _id } = payload;
    let requestPayload = {
      accountReference: _id,
    };
    try {
      let axiosConfig = {
        headers,
      };
      const { data } = await axios.get(`${url}/${_id}`, axiosConfig);

      const { requestSuccessful, responseBody } = data;

      Log.create({
        service: "monnify",
        httpMethod: "get",
        url,
        request: JSON.stringify(requestPayload),
        headers: JSON.stringify(headers),
        response: JSON.stringify(data),
        status: requestSuccessful ? "success" : "failed",
      });

      return {
        status: "success",
        message: "reserved account details fetched successfully",
        data: responseBody,
      };
    } catch (error) {
      console.log(error);
      const errMsg = error.response?.data
        ? error.response?.data?.message
        : error.message;

      Log.create({
        service: "monnify",
        httpMethod: "get",
        url,
        request: JSON.stringify(requestPayload),
        headers: JSON.stringify(headers),
        response: error.response?.data
          ? JSON.stringify(error.response?.data)
          : errMsg,
        status: "failed",
      });
      return {
        status: "failed",
        message: "Request failed",
      };
    }
  };

  getReservedAccountTransaction = async (payload) => {
    const tokenData = await this.authenticate();
    if (tokenData.status === "failed") {
      return {
        status: "failed",
        message: "Request failed",
      };
    }

    const url = `${config.MONNIFY_BASE_URL}/api/v2/bank-transfer/reserved-accounts/transactions`;
    const headers = {
      Authorization: `Bearer ${tokenData.data.token}`,
    };

    const { _id } = payload;
    let requestPayload = {
      accountReference: _id,
    };
    try {
      let axiosConfig = {
        headers,
      };
      const { data } = await axios.get(
        `${url}?accountReference=${_id}`,
        axiosConfig
      );

      const { requestSuccessful, responseBody } = data;

      Log.create({
        service: "monnify",
        httpMethod: "get",
        url,
        request: JSON.stringify(requestPayload),
        headers: JSON.stringify(headers),
        response: JSON.stringify(data),
        status: requestSuccessful ? "success" : "failed",
      });

      return {
        status: "success",
        message: "reserved account transactions fetched successfully",
        data: responseBody,
      };
    } catch (error) {
      console.log(error);
      const errMsg = error.response?.data
        ? error.response?.data?.message
        : error.message;

      Log.create({
        service: "monnify",
        httpMethod: "get",
        url,
        request: JSON.stringify(requestPayload),
        headers: JSON.stringify(headers),
        response: error.response?.data
          ? JSON.stringify(error.response?.data)
          : errMsg,
        status: "failed",
      });
      return {
        status: "failed",
        message: "Request failed",
      };
    }
  };

  deallocateReservedAccount = async (accountReference) => {
    const tokenData = await this.authenticate();
    if (tokenData.status === "failed") {
      return {
        status: "failed",
        message: "Request failed",
      };
    }

    const url = `${config.MONNIFY_BASE_URL}/api/v1/bank-transfer/reserved-accounts/${accountReference}`;
    const headers = {
      Authorization: `Bearer ${tokenData.data.token}`,
      "Content-Type": "application/json",
    };

    try {
      let axiosConfig = {
        headers,
      };

      // Send the DELETE request with no body
      const { data } = await axios.delete(url, axiosConfig);

      const { requestSuccessful, responseBody, responseMessage, responseCode } =
        data;

      Log.create({
        service: "monnify",
        httpMethod: "delete",
        url,
        request: JSON.stringify({ accountReference }),
        headers: JSON.stringify(headers),
        response: JSON.stringify(data),
        status: requestSuccessful ? "success" : "failed",
      });

      return {
        status: requestSuccessful ? "success" : "failed",
        message: responseMessage || "Request failed",
        data: responseBody,
        responseCode,
      };
    } catch (error) {
      console.log(error);
      const errMsg = error.response?.data
        ? error.response?.data?.message
        : error.message;

      Log.create({
        service: "monnify",
        httpMethod: "delete",
        url,
        request: JSON.stringify({ accountReference }),
        headers: JSON.stringify(headers),
        response: error.response?.data
          ? JSON.stringify(error.response?.data)
          : errMsg,
        status: "failed",
      });

      return {
        status: "failed",
        message: "Request failed",
      };
    }
  };

  initializeTransfer = async (payload) => {
    try {
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "Request failed",
      };
    }
  };

  checkTransferStatus = async (payload) => {
    try {
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "Request failed",
      };
    }
  };

  getBanks = async (payload) => {
    try {
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "Request failed",
      };
    }
  };

  saveWebhookEvents = async (payload) => {
    try {
      const { service, headers, body, query } = payload;

      const newWebhookEventPayload = {
        service: service.toLowerCase(),
        uniqueReference: body?.eventData?.transactionReference,
        headers: JSON.stringify(headers || {}),
        requestBody: JSON.stringify(body || {}),
        requestQuery: JSON.stringify(query || {}),
      };

      await Webhook.create(newWebhookEventPayload);

      return {
        status: "success",
        message: "webhook event saved successfully",
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "Request failed",
      };
    }
  };

  processReservedAccountTransactions = async (payload) => {
    try {
      const { eventData } = payload;
      if (!eventData) {
        return {
          status: "failed",
          message: "eventData is missing",
        };
      }

      if (
        eventData?.product?.type?.trim().toUpperCase() !== "RESERVED_ACCOUNT"
      ) {
        return {
          status: "failed",
          message: "Wrong product type",
        };
      }
      const reference = eventData?.transactionReference;
      const accountNumber =
        eventData?.destinationAccountInformation?.accountNumber;
      const amount = Number(eventData?.amountPaid);
      const paymentStatus = eventData?.paymentStatus;

      //check if transaction has been processed before
      const transactionExist = await Transaction.findOne({
        $or: [{ externalReference: reference }, { reference }],
      });

      if (transactionExist) {
        return {
          status: "failed",
          message: "Duplicate transaction",
        };
      }

      if (!accountNumber) {
        return {
          status: "failed",
          message: "Account number is undefined",
        };
      }

      //get the user of the virtual account
      const accountExists = await MonnifyVirtualAccount.findOne({
        accountNumber,
      });

      if (!accountExists) {
        return {
          status: "failed",
          message: "Account number could not be found",
        };
      }

      const userId = accountExists.user;

      //does user exist
      const userExists = await User.findOne({ _id: userId });

      if (!userExists) {
        return {
          status: "failed",
          message: "User does not exist",
        };
      }

      //add transaction
      const newTransactionPayload = {
        user: userExists._id,
        status:
          paymentStatus.toUpperCase() === "PAID" ? "successful" : "failed",
        amount,
        source: "deposit",
        reference,
        externalReference: reference,
      };

      await Transaction.create(newTransactionPayload);

      if (paymentStatus.toUpperCase() === "PAID") {
        //wallet credit
        const walletCreditRes = await WalletUtils.creditWallet({
          userId: userExists._id,
          amount,
          source: "deposit",
        });
        if (walletCreditRes.status == "failed") {
          return {
            status: "failed",
            message: walletCreditRes?.message || "failed to credit wallet",
          };
        }
      }

      return {
        status: "success",
        message: "Deposit event processed successfully",
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "Request failed",
      };
    }
  };

  handleWebhookEvents = async (payload) => {
    try {
      const { body, headers, query } = payload;

      //save webhook events
      const alreadySavedWebhook = await Webhook.findOne({
        service: "monnify",
        uniqueReference: body?.eventData?.transactionReference,
      });

      if (alreadySavedWebhook) {
        //save for record purpose
        this.saveWebhookEvents({ body, headers, query, service: "monnify" });
        return {
          status: "failed",
          message: "Webhook has already been received",
        };
      }

      //save before processing
      this.saveWebhookEvents({ body, headers, query, service: "monnify" });

      //verify hash
      const hash = headers?.["monnify-signature"];
      const requestPayload = body;
      const hashData = JSON.stringify(requestPayload || {});

      const calculatedHash = crypto
        .createHmac("sha512", config.MONNIFY_SECRET_KEY)
        .update(hashData)
        .digest("hex");

      if (calculatedHash !== hash) {
        return {
          status: "failed",
          message: "Invalid request! Hash do not match",
        };
      }

      //check for incoming event
      const eventType = requestPayload.eventType;

      //for reserved account
      if (eventType.trim()?.toUpperCase() === "SUCCESSFUL_TRANSACTION") {
        const processRes = await this.processReservedAccountTransactions(
          requestPayload
        );

        return {
          status: processRes.status,
          message: processRes.message,
        };
      }
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "Request failed",
      };
    }
  };
}

module.exports = new MonnifyService();
