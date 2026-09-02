import axios from 'axios';
import Joi from 'joi';
import otpStore from '../otp-store.js';
import dotenv from 'dotenv';

dotenv.config();

const emailVerification = async (req, res) => {
  console.log("✅ /send-otp endpoint hit, body:", req.body);

  const emailSchema = Joi.object({
    email: Joi.string().email().required()
  });

  const { error, value } = emailSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: 'Invalid email format'
    });
  }

  function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  const email = value.email;
  const otp = generateOTP();
  const expiry = Date.now() + 5 * 60 * 1000;

  otpStore[email] = {
    otp,
    expiry
  };

  const mailHTML = `
        <div style="font-family: Arial, sans-serif;">
            <h1>AI Career Navigator</h1>

            <h2>OTP Verification</h2>

            <p>Use the following OTP to verify your email:</p>

            <h1 style="
                background-color: #f1f1f1;
                padding: 10px;
                width: fit-content;
            ">
                ${otp}
            </h1>

            <p>
                This OTP is valid for <strong>5 minutes</strong>.
            </p>

            <p>
                Thanks for <strong>registering</strong>.
            </p>

            <p style="font-size: 12px; color: gray;">
                If you didn't request this, you can safely ignore it.
            </p>
        </div>
    `;

  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'AI Career Navigator',
          email: process.env.BREVO_SENDER_EMAIL
        },

        to: [
          {
            email: email
          }
        ],

        subject: 'Your OTP Verification Code',

        htmlContent: mailHTML
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    console.log('✅ Brevo email sent:', response.data);

    return res.status(200).json({
      message: 'OTP sent to email'
    });

  } catch (err) {
    console.error(
      '❌ Brevo error:',
      err.response?.data || err.message
    );

    return res.status(500).json({
      error: 'Failed to send OTP',
      details: err.response?.data?.message || err.message
    });
  }
};

export { emailVerification };