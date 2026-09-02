import { Resend } from 'resend';
import Joi from 'joi';
import otpStore from '../otp-store.js';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

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

  // Store OTP
  otpStore[email] = {
    otp,
    expiry
  };

  const mailOptions = {
    from: 'AI Career Navigator <onboarding@resend.dev>',
    to: [email],
    subject: 'Your OTP Verification Code',
    html: `
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
    `
  };

  try {
    const { data, error } = await resend.emails.send(mailOptions);

    if (error) {
      console.error('❌ Resend error:', error);

      return res.status(500).json({
        error: 'Failed to send OTP',
        details: error.message || 'Email sending failed'
      });
    }

    console.log('✅ OTP email sent:', data);

    return res.status(200).json({
      message: 'OTP sent to email'
    });

  } catch (err) {
    console.error('❌ Error sending email:', err);

    return res.status(500).json({
      error: 'Failed to send OTP',
      details: err.message
    });
  }
};

export { emailVerification };