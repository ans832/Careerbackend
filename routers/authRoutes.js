import express from 'express';
import { emailVerification } from '../controllers/emailVerification.js';
import { verifyOtp } from '../controllers/verifyOtp.js';
import { aiChatController } from '../controllers/aiRoutes.js';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import { createBooking } from '../controllers/create-bookings.js';

dotenv.config();

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/send-otp', emailVerification);
router.post('/verify-otp', verifyOtp);
router.post('/chat', aiChatController);
router.post('/create-order', async (req, res) => {
  const { amount } = req.body; // amount in rupees

  try {
    

    const order = await razorpay.orders.create({
      amount: amount * 100, // in paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    });

    
    res.json(order);
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ error: err.message, details: err });
  }
});

router.post('/create-booking', createBooking);

export default router;
