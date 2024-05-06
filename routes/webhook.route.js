const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

// monnify transactions
router.post('/monnify-transaction', webhookController.handleMonnifyTransactions);

// vtpass transactions
router.post('/vt-pass-transaction', webhookController.handleVtPassTransactions);


module.exports = router;
