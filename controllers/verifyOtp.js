import Joi from 'joi';
import otpStore from '../otp-store.js';
import jwt from 'jsonwebtoken';
import User from '../model/userModel.js';

const verifyOtp = async (req, res) => {
  const otpSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required()
  });

  const { error, value } = otpSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: 'Invalid email or OTP format' });
  }

  const { email, otp } = value;
  const data = otpStore[email];

  if (!data) {
    return res.status(400).json({ error: 'No OTP found for this email' });
  }

  if (Date.now() > data.expiry) {
    delete otpStore[email];
    return res.status(400).json({ error: 'OTP expired' });
  }

  if (data.otp !== otp) {
    return res.status(400).json({ error: 'Invalid OTP' });
  }

  delete otpStore[email]; // OTP verified, remove from store

  try {
    // Save email to DB if not already saved
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email });
      await user.save();
    }

    // Generate JWT Token
    const token = jwt.sign({ email, userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log(`Token generated for user ${user._id} with email ${email}`);
    

    return res.status(200).json({
      message: 'OTP verified successfully, email saved, token generated.',
      token
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error while saving email or generating token' });
  }
};

export { verifyOtp };
