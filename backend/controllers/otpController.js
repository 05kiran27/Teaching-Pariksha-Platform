require('dotenv').config();
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Temporary store (use Redis or DB in production)
const otpStore = {};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP with custom message
exports.sendOTPNumber = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone number is required" });

    const otp = generateOTP();
    otpStore[phone] = otp;

    const message = `Hii your one-time password for teaching pariksha (OTP) is ${otp}. It will expire in 5 minutes.`;

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER, // e.g., "+1415XXXXXXX" (from your Twilio console)
      to: phone,
    });

    console.log(`OTP for ${phone}: ${otp}`);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending OTP", error: error.message });
  }
};

// Verify OTP
exports.verifyOTPNumber = async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ message: "Phone and code are required" });

    if (otpStore[phone] && otpStore[phone] === code) {
      delete otpStore[phone]; // clear after verification
      return res.status(200).json({ message: "Phone verified successfully" });
    }

    res.status(400).json({ message: "Invalid or expired OTP" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error verifying OTP", error: error.message });
  }
};
