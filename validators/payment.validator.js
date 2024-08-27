const Joi = require("joi");
const handleResponse = require("../helpers/response");

class PaymentValidator {
  checkTransactions = async (req, res, next) => {
    const schema = Joi.object({
      page: Joi.number().integer().optional(),
      perPage: Joi.number().integer().optional(),
      status: Joi.string().valid("successful", "failed", "pending").optional(),
      source: Joi.string().optional(),
      serviceId: Joi.string().optional(),
      beneficiary: Joi.string().optional(),
    });

    const { error } = schema.validate(req.query);

    if (error) {
      return handleResponse(
        req,
        res,
        { status: "error", message: error.message },
        422
      );
    }

    return next();
  };

  initializeDepositViaMonnify = async (req, res, next) => {
    const schema = Joi.object({
      amount: Joi.number().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return handleResponse(
        req,
        res,
        { status: "error", message: error.message },
        422
      );
    }

    return next();
  };

  buyAirtime = async (req, res, next) => {
    const schema = Joi.object({
      amount: Joi.number().required(),
      phone: Joi.string().required(),
      serviceId: Joi.string()
        .valid("mtn", "glo", "airtel", "etisalat")
        .required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return handleResponse(
        req,
        res,
        { status: "error", message: error.message },
        422
      );
    }

    return next();
  };

  getVariationCodes = async (req, res, next) => {
    const schema = Joi.object({
      serviceId: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return handleResponse(
        req,
        res,
        { status: "error", message: error.message },
        422
      );
    }

    return next();
  };

  buyData = async (req, res, next) => {
    const schema = Joi.object({
      amount: Joi.number().required(),
      phone: Joi.string().required(),
      serviceId: Joi.string()
        .valid(
          "mtn-data",
          "glo-data",
          "airtel-data",
          "etisalat-data",
          "9mobile-sme-data",
          "smile-direct",
          "spectranet"
        )
        .required(),
      billersCode: Joi.string().required(),
      variationCode: Joi.string().required(),
      quantity: Joi.number().optional(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return handleResponse(
        req,
        res,
        { status: "error", message: error.message },
        422
      );
    }

    return next();
  };

  verifySmileEmail = async (req, res, next) => {
    const schema = Joi.object({
      serviceId: Joi.string().required(),
      billersCode: Joi.string().email().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return handleResponse(
        req,
        res,
        { status: "error", message: error.message },
        422
      );
    }

    return next();
  };

  payTvSubscription = async (req, res, next) => {
    const schema = Joi.object({
      amount: Joi.number().required(),
      phone: Joi.string().required(),
      serviceId: Joi.string()
        .valid("dstv", "gotv", "startimes", "showmax")
        .required(),
      billersCode: Joi.string().required(),
      variationCode: Joi.string().required(),
      quantity: Joi.number().optional(),
      subscriptionType: Joi.string().valid("change", "renew").optional(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return handleResponse(
        req,
        res,
        { status: "error", message: error.message },
        422
      );
    }

    return next();
  };

  verifySmartCardNumber = async (req, res, next) => {
    const schema = Joi.object({
      serviceId: Joi.string().required(),
      billersCode: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return handleResponse(
        req,
        res,
        { status: "error", message: error.message },
        422
      );
    }

    return next();
  };

  payElectricityBill = async (req, res, next) => {
    const schema = Joi.object({
      amount: Joi.number().required(),
      phone: Joi.string().required(),
      serviceId: Joi.string()
        .valid(
          "ikeja-electric",
          "eko-electric",
          "kano-electric",
          "portharcourt-electric",
          "jos-electric",
          "ibadan-electric",
          "kaduna-electric",
          "abuja-electric",
          "enugu-electric",
          "benin-electric",
          "aba-electric",
          "yola-electric"
        )
        .required(),
      billersCode: Joi.string().required(),
      variationCode: Joi.string().valid("prepaid", "postpaid").required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return handleResponse(
        req,
        res,
        { status: "error", message: error.message },
        422
      );
    }

    return next();
  };

  verifyMeterNumber = async (req, res, next) => {
    const schema = Joi.object({
      serviceId: Joi.string().required(),
      billersCode: Joi.string().required(),
      type: Joi.string().valid("prepaid", "postpaid").required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return handleResponse(
        req,
        res,
        { status: "error", message: error.message },
        422
      );
    }

    return next();
  };

  payEducationalBill = async (req, res, next) => {
    const schema = Joi.object({
      amount: Joi.number().required(),
      phone: Joi.string().required(),
      serviceId: Joi.string()
        .valid("waec-registration", "waec", "jamb")
        .required(),
      variationCode: Joi.string().required(),
      billersCode: Joi.when("serviceId", {
        is: Joi.equal("jamb"),
        then: Joi.string().required(),
        otherwise: Joi.string().optional(),
      }),
      quantity: Joi.number().optional(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return handleResponse(
        req,
        res,
        { status: "error", message: error.message },
        422
      );
    }

    return next();
  };

  verifyProfileId = async (req, res, next) => {
    const schema = Joi.object({
      serviceId: Joi.string().required(),
      billersCode: Joi.string().required(),
      type: Joi.string().valid("jamb").required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return handleResponse(
        req,
        res,
        { status: "error", message: error.message },
        422
      );
    }

    return next();
  };

  reQueryTransaction = async (req, res, next) => {
    const schema = Joi.object({
      requestId: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return handleResponse(
        req,
        res,
        { status: "error", message: error.message },
        422
      );
    }

    return next();
  };
}

module.exports = new PaymentValidator();
