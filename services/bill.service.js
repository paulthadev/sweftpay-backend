const config = require("../config/variables");
const axios = require("axios");
const Log = require("../models/Log");
const Webhook = require("../models/Webhook");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const WalletUtils = require("../utils/wallet");

class BillService {
  getConfig = async (payload) => {
    try {
      const { requestType, basic } = payload;

      let configParams = {};
      if (requestType === "post") {
        configParams = {
          "api-key": config.VT_PASS_API_KEY,
          "secret-key": config.VT_PASS_SECRET_KEY,
        };
      }

      if (requestType === "get") {
        configParams = {
          "api-key": config.VT_PASS_API_KEY,
          "public-key": config.VT_PASS_PUBLIC_KEY,
        };
      }

      if (basic) {
        const clientSecret = Buffer.from(
          `${config.VT_PASS_USERNAME}:${config.VT_PASS_PASSWORD}`
        ).toString("base64");

        configParams = {
          Authorization: `Basic ${clientSecret}`,
        };
      }

      return {
        status: "success",
        message: "config retrieved successfully",
        data: { config: configParams },
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "Request failed",
      };
    }
  };

  buyAirtime = async (payload) => {
    const getConfigRes = await this.getConfig({ requestType: "post" });
    if (getConfigRes.status === "failed") {
      return {
        status: "failed",
        message: "Request failed, try again later",
      };
    }

    const url = `${config.VT_PASS_BASE_URL}/api/pay`;
    const requestConfig = getConfigRes?.data?.config;
    const headers = {
      ...requestConfig,
    };

    const { serviceId, phone, amount, reference } = payload;

    let requestPayload = {
      request_id: reference,
      serviceID: serviceId,
      amount: amount,
      phone,
    };

    try {
      let axiosConfig = {
        headers,
      };
      const { data } = await axios.post(url, requestPayload, axiosConfig);

      Log.create({
        service: "vtPass",
        httpMethod: "post",
        url,
        request: JSON.stringify(requestPayload),
        headers: JSON.stringify(headers),
        response: JSON.stringify(data),
        status: data?.code === "000" ? "success" : "failed",
      });

      if (data?.code !== "000" || data?.content?.error) {
        return {
          status: "failed",
          message:
            data?.content?.error ||
            "Request failed to complete, try again later",
        };
      }

      return {
        status: "success",
        message: "Airtime purchased successfully",
        data: data,
      };
    } catch (error) {
      console.log(error);
      const errMsg = error.response?.data
        ? error.response?.data?.message
        : error.message;

      Log.create({
        service: "vtPass",
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

  getDataVariationCodes = async (payload) => {
    const getConfigRes = await this.getConfig({ requestType: "get" });
    if (getConfigRes.status === "failed") {
      return {
        status: "failed",
        message: "Request failed, try again later",
      };
    }

    const url = `${config.VT_PASS_BASE_URL}/api/service-variations`;
    const requestConfig = getConfigRes?.data?.config;
    const headers = {
      ...requestConfig,
    };

    const { serviceId } = payload;

    let requestPayload = {
      serviceID: serviceId,
    };

    try {
      let axiosConfig = {
        headers,
      };
      const { data } = await axios.get(
        `${url}?serviceID=${serviceId}`,
        axiosConfig
      );

      Log.create({
        service: "vtPass",
        httpMethod: "get",
        url,
        request: JSON.stringify(requestPayload),
        headers: JSON.stringify(headers),
        response: JSON.stringify(data),
        status: data?.response_description === "000" ? "success" : "failed",
      });

      if (data?.response_description !== "000") {
        return {
          status: "failed",
          message: "Request failed to complete, try again later",
        };
      }

      return {
        status: "success",
        message: "Variation codes fetched successfully",
        data: data?.content || data,
      };
    } catch (error) {
      console.log(error);
      const errMsg = error.response?.data
        ? error.response?.data?.message
        : error.message;

      Log.create({
        service: "vtPass",
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

  buyData = async (payload) => {
    const getConfigRes = await this.getConfig({
      requestType: "post",
      basic:
        payload?.serviceId === "smile-direct" || "spectranet"
          ? true
          : undefined,
    });
    if (getConfigRes.status === "failed") {
      return {
        status: "failed",
        message: "Request failed, try again later",
      };
    }

    const url = `${config.VT_PASS_BASE_URL}/api/pay`;
    const requestConfig = getConfigRes?.data?.config;
    const headers = {
      ...requestConfig,
    };

    const {
      serviceId,
      phone,
      amount,
      reference,
      billersCode,
      variationCode,
      quantity,
    } = payload;

    let requestPayload = {
      request_id: reference,
      serviceID: serviceId,
      billersCode,
      variation_code: variationCode,
      amount: amount,
      phone,
      quantity: quantity,

      // quantity: serviceId === "spectranet" ? quantity : undefined,
    };

    try {
      let axiosConfig = {
        headers,
      };
      const { data } = await axios.post(url, requestPayload, axiosConfig);

      Log.create({
        service: "vtPass",
        httpMethod: "post",
        url,
        request: JSON.stringify(requestPayload),
        headers: JSON.stringify(headers),
        response: JSON.stringify(data),
        status: data?.code === "000" ? "success" : "failed",
      });

      if (data?.code !== "000" || data?.content?.error) {
        return {
          status: "failed",
          message:
            data?.content?.error ||
            "Request failed to complete, try again later",
        };
      }

      return {
        status: "success",
        message: "Data purchased successfully",
        data: data,
      };
    } catch (error) {
      console.log(error);
      const errMsg = error.response?.data
        ? error.response?.data?.message
        : error.message;

      Log.create({
        service: "vtPass",
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

  verifySmileEmail = async (payload) => {
    const getConfigRes = await this.getConfig({ requestType: "post" });
    if (getConfigRes.status === "failed") {
      return {
        status: "failed",
        message: "Request failed, try again later",
      };
    }

    const url = `${config.VT_PASS_BASE_URL}/api/merchant-verify/smile/email`;
    const requestConfig = getConfigRes?.data?.config;
    const headers = {
      ...requestConfig,
    };

    const { serviceId, billersCode } = payload;

    let requestPayload = {
      serviceID: serviceId,
      billersCode,
    };

    try {
      let axiosConfig = {
        headers,
      };
      const { data } = await axios.post(`${url}`, requestPayload, axiosConfig);

      Log.create({
        service: "vtPass",
        httpMethod: "post",
        url,
        request: JSON.stringify(requestPayload),
        headers: JSON.stringify(headers),
        response: JSON.stringify(data),
        status: data?.code === "000" ? "success" : "failed",
      });

      if (data?.code !== "000" || data?.content?.error) {
        return {
          status: "failed",
          message:
            data?.content?.error ||
            "Request failed to complete, try again later",
        };
      }

      return {
        status: "success",
        message: "Email verified successfully",
        data: data?.content || data,
      };
    } catch (error) {
      console.log(error);
      const errMsg = error.response?.data
        ? error.response?.data?.message
        : error.message;

      Log.create({
        service: "vtPass",
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

  payTVSubscription = async (payload) => {
    const getConfigRes = await this.getConfig({
      requestType: "post",
      basic: payload?.serviceId === "dstv" ? true : undefined,
    });
    if (getConfigRes.status === "failed") {
      return {
        status: "failed",
        message: "Request failed, try again later",
      };
    }

    const url = `${config.VT_PASS_BASE_URL}/api/pay`;
    const requestConfig = getConfigRes?.data?.config;
    const headers = {
      ...requestConfig,
    };

    const {
      serviceId,
      phone,
      amount,
      reference,
      billersCode,
      variationCode,
      quantity,
      subscriptionType,
    } = payload;

    let requestPayload = {
      request_id: reference,
      serviceID: serviceId,
      billersCode,
      variation_code: variationCode,
      amount: amount,
      phone,
      quantity,
      subscription_type: subscriptionType,
    };

    try {
      let axiosConfig = {
        headers,
      };
      const { data } = await axios.post(url, requestPayload, axiosConfig);

      Log.create({
        service: "vtPass",
        httpMethod: "post",
        url,
        request: JSON.stringify(requestPayload),
        headers: JSON.stringify(headers),
        response: JSON.stringify(data),
        status: data?.code === "000" ? "success" : "failed",
      });

      if (data?.code !== "000" || data?.content?.error) {
        return {
          status: "failed",
          message:
            data?.content?.error ||
            "Request failed to complete, try again later",
        };
      }

      return {
        status: "success",
        message: "Data purchased successfully",
        data: data,
      };
    } catch (error) {
      console.log(error);
      const errMsg = error.response?.data
        ? error.response?.data?.message
        : error.message;

      Log.create({
        service: "vtPass",
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

  verifySmartCardNumber = async (payload) => {
    const getConfigRes = await this.getConfig({ requestType: "post" });
    if (getConfigRes.status === "failed") {
      return {
        status: "failed",
        message: "Request failed, try again later",
      };
    }

    const url = `${config.VT_PASS_BASE_URL}/api/merchant-verify`;
    const requestConfig = getConfigRes?.data?.config;
    const headers = {
      ...requestConfig,
    };

    const { serviceId, billersCode } = payload;

    let requestPayload = {
      serviceID: serviceId,
      billersCode,
    };

    try {
      let axiosConfig = {
        headers,
      };
      const { data } = await axios.post(`${url}`, requestPayload, axiosConfig);

      Log.create({
        service: "vtPass",
        httpMethod: "post",
        url,
        request: JSON.stringify(requestPayload),
        headers: JSON.stringify(headers),
        response: JSON.stringify(data),
        status: data?.code === "000" ? "success" : "failed",
      });

      if (data?.code !== "000" || data?.content?.error) {
        return {
          status: "failed",
          message:
            data?.content?.error ||
            "Request failed to complete, try again later",
        };
      }

      return {
        status: "success",
        message: "Smart card number verified successfully",
        data: data?.content || data,
      };
    } catch (error) {
      console.log(error);
      const errMsg = error.response?.data
        ? error.response?.data?.message
        : error.message;

      Log.create({
        service: "vtPass",
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

  payElectricityBill = async (payload) => {
    const getConfigRes = await this.getConfig({
      requestType: "post",
    });
    if (getConfigRes.status === "failed") {
      return {
        status: "failed",
        message: "Request failed, try again later",
      };
    }

    const url = `${config.VT_PASS_BASE_URL}/api/pay`;
    const requestConfig = getConfigRes?.data?.config;
    const headers = {
      ...requestConfig,
    };

    const { serviceId, phone, amount, reference, billersCode, variationCode } =
      payload;

    let requestPayload = {
      request_id: reference,
      serviceID: serviceId,
      billersCode,
      variation_code: variationCode,
      amount: amount,
      phone,
    };

    try {
      let axiosConfig = {
        headers,
      };
      const { data } = await axios.post(url, requestPayload, axiosConfig);

      Log.create({
        service: "vtPass",
        httpMethod: "post",
        url,
        request: JSON.stringify(requestPayload),
        headers: JSON.stringify(headers),
        response: JSON.stringify(data),
        status: data?.code === "000" ? "success" : "failed",
      });

      if (data?.code !== "000") {
        return {
          status: "failed",
          message: "Request failed to complete, try again later",
        };
      }

      return {
        status: "success",
        message: "Data purchased successfully",
        data: data,
      };
    } catch (error) {
      console.log(error);
      const errMsg = error.response?.data
        ? error.response?.data?.message
        : error.message;

      Log.create({
        service: "vtPass",
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

  verifyMeterNumber = async (payload) => {
    const getConfigRes = await this.getConfig({ requestType: "post" });
    if (getConfigRes.status === "failed") {
      return {
        status: "failed",
        message: "Request failed, try again later",
      };
    }

    const url = `${config.VT_PASS_BASE_URL}/api/merchant-verify`;
    const requestConfig = getConfigRes?.data?.config;
    const headers = {
      ...requestConfig,
    };

    const { serviceId, billersCode, type } = payload;

    let requestPayload = {
      serviceID: serviceId,
      billersCode,
      type,
    };

    try {
      let axiosConfig = {
        headers,
      };
      const { data } = await axios.post(`${url}`, requestPayload, axiosConfig);

      Log.create({
        service: "vtPass",
        httpMethod: "post",
        url,
        request: JSON.stringify(requestPayload),
        headers: JSON.stringify(headers),
        response: JSON.stringify(data),
        status: data?.code === "000" ? "success" : "failed",
      });

      if (data?.code !== "000" || data?.content?.error) {
        return {
          status: "failed",
          message:
            data?.content?.error ||
            "Request failed to complete, try again later",
        };
      }

      return {
        status: "success",
        message: "Smart card number verified successfully",
        data: data?.content || data,
      };
    } catch (error) {
      console.log(error);
      const errMsg = error.response?.data
        ? error.response?.data?.message
        : error.message;

      Log.create({
        service: "vtPass",
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

  payEducationalBill = async (payload) => {
    const getConfigRes = await this.getConfig({
      requestType: "post",
    });
    if (getConfigRes.status === "failed") {
      return {
        status: "failed",
        message: "Request failed, try again later",
      };
    }

    const url = `${config.VT_PASS_BASE_URL}/api/pay`;
    const requestConfig = getConfigRes?.data?.config;
    const headers = {
      ...requestConfig,
    };

    const {
      serviceId,
      phone,
      amount,
      reference,
      variationCode,
      quantity,
      billersCode,
    } = payload;

    let requestPayload = {
      request_id: reference,
      serviceID: serviceId,
      billersCode: serviceId == "jamb" ? billersCode : undefined,
      variation_code: variationCode,
      amount: amount,
      phone,
      quantity,
    };

    try {
      let axiosConfig = {
        headers,
      };
      const { data } = await axios.post(url, requestPayload, axiosConfig);

      Log.create({
        service: "vtPass",
        httpMethod: "post",
        url,
        request: JSON.stringify(requestPayload),
        headers: JSON.stringify(headers),
        response: JSON.stringify(data),
        status: data?.code === "000" ? "success" : "failed",
      });

      if (data?.code !== "000") {
        return {
          status: "failed",
          message: "Request failed to complete, try again later",
        };
      }

      return {
        status: "success",
        message: "Data purchased successfully",
        data: data,
      };
    } catch (error) {
      console.log(error);
      const errMsg = error.response?.data
        ? error.response?.data?.message
        : error.message;

      Log.create({
        service: "vtPass",
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

  verifyProfileId = async (payload) => {
    const getConfigRes = await this.getConfig({ requestType: "post" });
    if (getConfigRes.status === "failed") {
      return {
        status: "failed",
        message: "Request failed, try again later",
      };
    }

    const url = `${config.VT_PASS_BASE_URL}/api/merchant-verify`;
    const requestConfig = getConfigRes?.data?.config;
    const headers = {
      ...requestConfig,
    };

    const { serviceId, billersCode, type } = payload;

    let requestPayload = {
      serviceID: serviceId,
      billersCode,
      type,
    };

    try {
      let axiosConfig = {
        headers,
      };
      const { data } = await axios.post(`${url}`, requestPayload, axiosConfig);

      Log.create({
        service: "vtPass",
        httpMethod: "post",
        url,
        request: JSON.stringify(requestPayload),
        headers: JSON.stringify(headers),
        response: JSON.stringify(data),
        status: data?.code === "000" ? "success" : "failed",
      });

      if (data?.code !== "000" || data?.content?.error) {
        return {
          status: "failed",
          message:
            data?.content?.error ||
            "Request failed to complete, try again later",
        };
      }

      return {
        status: "success",
        message: "Profile Id verified successfully",
        data: data?.content || data,
      };
    } catch (error) {
      console.log(error);
      const errMsg = error.response?.data
        ? error.response?.data?.message
        : error.message;

      Log.create({
        service: "vtPass",
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

  payInsuranceBill = async (payload) => {
    const getConfigRes = await this.getConfig({
      requestType: "post",
      basic: payload?.serviceId === "ui-insure" ? true : undefined,
    });
    if (getConfigRes.status === "failed") {
      return {
        status: "failed",
        message: "Request failed, try again later",
      };
    }

    const url = `${config.VT_PASS_BASE_URL}/api/pay`;
    const requestConfig = getConfigRes?.data?.config;
    const headers = {
      ...requestConfig,
    };

    const {
      serviceId,
      phone,
      amount,
      reference,
      variationCode,
      billersCode,
      issuedName,
      engineNumber,
      chasisNumber,
      plateNumber,
      vehicleMake,
      vehicleColor,
      vehicleModel,
      yearOfMake,
      contactAddress,
      fullName,
      address,
      selectedHospital,
      passportPhoto,
      dateOfBirth,
      extraInfo,
      nextKinName,
      nextKinPhone,
      businessOccupation,
    } = payload;

    let requestPayload = {
      request_id: reference,
      serviceID: serviceId,
      billersCode: serviceId == "jamb" ? billersCode : undefined,
      variation_code: variationCode,
      amount: amount,
      phone,
      Issued_Name: issuedName,
      Engine_Number: engineNumber,
      Chasis_Number: chasisNumber,
      Plate_Number: plateNumber,
      Vehicle_Make: vehicleMake,
      Vehicle_Color: vehicleColor,
      Vehicle_Model: vehicleModel,
      Year_of_Make: yearOfMake,
      Contact_Address: contactAddress,
      full_name: fullName,
      address,
      selected_hospital: selectedHospital,
      Passport_Photo: passportPhoto,
      date_of_birth: dateOfBirth,
      extra_info: extraInfo,
      dob: dateOfBirth,
      next_kin_name: nextKinName,
      next_kin_phone: nextKinPhone,
      business_occupation: businessOccupation,
    };

    try {
      let axiosConfig = {
        headers,
      };
      const { data } = await axios.post(url, requestPayload, axiosConfig);

      Log.create({
        service: "vtPass",
        httpMethod: "post",
        url,
        request: JSON.stringify(requestPayload),
        headers: JSON.stringify(headers),
        response: JSON.stringify(data),
        status: data?.code === "000" ? "success" : "failed",
      });

      if (data?.code !== "000") {
        return {
          status: "failed",
          message: "Request failed to complete, try again later",
        };
      }

      return {
        status: "success",
        message: "Data purchased successfully",
        data: data,
      };
    } catch (error) {
      console.log(error);
      const errMsg = error.response?.data
        ? error.response?.data?.message
        : error.message;

      Log.create({
        service: "vtPass",
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

  getExtraFields = async (payload) => {
    const getConfigRes = await this.getConfig({ requestType: "get" });
    if (getConfigRes.status === "failed") {
      return {
        status: "failed",
        message: "Request failed, try again later",
      };
    }

    const url = `${config.VT_PASS_BASE_URL}/api/extra-fields`;
    const requestConfig = getConfigRes?.data?.config;
    const headers = {
      ...requestConfig,
    };

    const { serviceId } = payload;

    let requestPayload = {
      serviceID: serviceId,
    };

    try {
      let axiosConfig = {
        headers,
      };
      const { data } = await axios.get(
        `${url}?serviceID=${serviceId}`,
        axiosConfig
      );

      Log.create({
        service: "vtPass",
        httpMethod: "get",
        url,
        request: JSON.stringify(requestPayload),
        headers: JSON.stringify(headers),
        response: JSON.stringify(data),
        status: data?.code === "000" ? "success" : "failed",
      });

      if (data?.code !== "000") {
        return {
          status: "failed",
          message: "Request failed to complete, try again later",
        };
      }

      return {
        status: "success",
        message: "Extra fields fetched successfully",
        data: data?.content || data,
      };
    } catch (error) {
      console.log(error);
      const errMsg = error.response?.data
        ? error.response?.data?.message
        : error.message;

      Log.create({
        service: "vtPass",
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

  getOptions = async (payload) => {
    const getConfigRes = await this.getConfig({ requestType: "get" });
    if (getConfigRes.status === "failed") {
      return {
        status: "failed",
        message: "Request failed, try again later",
      };
    }

    const url = `${config.VT_PASS_BASE_URL}/api/options`;
    const requestConfig = getConfigRes?.data?.config;
    const headers = {
      ...requestConfig,
    };

    const { serviceId, name } = payload;

    let requestPayload = {
      serviceID: serviceId,
    };

    try {
      let axiosConfig = {
        headers,
      };
      const { data } = await axios.get(
        `${url}?serviceID=${serviceId}&name=${name}`,
        axiosConfig
      );

      Log.create({
        service: "vtPass",
        httpMethod: "get",
        url,
        request: JSON.stringify(requestPayload),
        headers: JSON.stringify(headers),
        response: JSON.stringify(data),
        status: data?.code === "000" ? "success" : "failed",
      });

      if (data?.code !== "000") {
        return {
          status: "failed",
          message: "Request failed to complete, try again later",
        };
      }

      return {
        status: "success",
        message: "Options fetched successfully",
        data: data?.content || data,
      };
    } catch (error) {
      console.log(error);
      const errMsg = error.response?.data
        ? error.response?.data?.message
        : error.message;

      Log.create({
        service: "vtPass",
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

  reQueryTransaction = async (payload) => {
    const getConfigRes = await this.getConfig({ requestType: "post" });
    if (getConfigRes.status === "failed") {
      return {
        status: "failed",
        message: "Request failed, try again later",
      };
    }

    const url = `${config.VT_PASS_BASE_URL}/api/requery`;
    const requestConfig = getConfigRes?.data?.config;
    const headers = {
      ...requestConfig,
    };

    const { requestId } = payload;

    let requestPayload = {
      request_id: requestId,
    };

    try {
      let axiosConfig = {
        headers,
      };
      const { data } = await axios.post(`${url}`, requestPayload, axiosConfig);

      Log.create({
        service: "vtPass",
        httpMethod: "post",
        url,
        request: JSON.stringify(requestPayload),
        headers: JSON.stringify(headers),
        response: JSON.stringify(data),
        status: data?.code === "000" ? "success" : "failed",
      });

      if (data?.code !== "000") {
        return {
          status: "failed",
          message: "Request failed to complete, try again later",
        };
      }

      return {
        status: "success",
        message: "Transaction re-queried successfully",
        data: data?.content || data,
      };
    } catch (error) {
      console.log(error);
      const errMsg = error.response?.data
        ? error.response?.data?.message
        : error.message;

      Log.create({
        service: "vtPass",
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

  processTransactionsUpdateEvent = async (payload) => {
    try {
      const { data: eventData } = payload;
      if (!eventData) {
        return {
          status: "failed",
          message: "eventData is missing",
        };
      }

      const reference = eventData?.requestId;
      const paymentStatus = eventData?.content?.transactions?.status;

      //check if transaction has been processed before
      const transactionExist = await Transaction.findOne({
        $or: [{ externalReference: reference }, { reference }],
      });

      if (!transactionExist) {
        return {
          status: "failed",
          message: "Invalid transaction",
        };
      }

      if (
        transactionExist.status == "successful" &&
        (paymentStatus === "successful" || paymentStatus === "delivered")
      ) {
        return {
          status: "success",
          message: "Transaction already processed",
        };
      }

      const userId = transactionExist.user;

      //does user exist
      const userExists = await User.findOne({ _id: userId });

      if (!userExists) {
        return {
          status: "failed",
          message: "User does not exist",
        };
      }

      if (paymentStatus === "failed" || paymentStatus === "reversed") {
        if (transactionExist.status === "failed") {
          return {
            status: "success",
            message: "Transaction already processed",
          };
        }
        await Transaction.updateOne(
          { _id: transactionExist._id },
          { status: "failed" }
        );

        //wallet credit
        const walletCreditRes = await WalletUtils.creditWallet({
          userId: userExists._id,
          amount: Number(transactionExist.amount),
          source: "bill-payment-reversal",
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
        message: "Bill payment event processed successfully",
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

      const eventType = body?.type;

      //save webhook events
      const uniqueReference = body?.data?.requestId;
      if (uniqueReference) {
        const alreadySavedWebhook = await Webhook.findOne({
          service: "vtPass",
          uniqueReference: body?.eventData?.transactionReference,
        });

        if (alreadySavedWebhook) {
          //save for record purpose
          this.saveWebhookEvents({ body, headers, query, service: "vtPass" });
          return {
            status: "failed",
            message: "Webhook has already been received",
          };
        }
      }

      //save before processing
      this.saveWebhookEvents({ body, headers, query, service: "vtPass" });

      let processRes = {
        status: "success",
        message: "Processed",
      };

      if (eventType.toLowerCase() === "transaction-update") {
        processRes = await this.processTransactionsUpdateEvent(body);
      }

      if (eventType.toLowerCase() === "variations-update") {
      }

      return {
        status: processRes?.status || "success",
        message: processRes?.message || "Processed",
      };
    } catch (error) {
      console.log(error);
      return {
        status: "failed",
        message: "Request failed",
      };
    }
  };
}

module.exports = new BillService();
