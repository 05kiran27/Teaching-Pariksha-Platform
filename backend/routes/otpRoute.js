const express = require('express');
const router = express.Router();
const { sendOTPNumber, verifyOTPNumber } = require('../controllers/otpController');

router.post('/number/send-otp', sendOTPNumber);
router.post('/verify-otp', verifyOTPNumber);

module.exports = router;
