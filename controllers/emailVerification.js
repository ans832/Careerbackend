import nodemailer from 'nodemailer'; // ⬅️ Nodemailer for sending emails
import Joi from 'joi'; // ⬅️ Joi for validation
import otpStore  from '../otp-store.js'; // ⬅️ shared OTP store
import dotenv from 'dotenv'; // ⬅️ dotenv for environment variables
dotenv.config(); // ⬅️ Load environment variables

const emailVerification = async(req,res)=>{
     console.log("✅ /send-otp endpoint hit, body:", req.body);


    
    // Email validation schema using Joi
    const emailSchema = Joi.object({
      email: Joi.string().email().required()
    });
    
    // const otpSchema = Joi.object({
    //   email: Joi.string().email().required(),
    //   otp: Joi.string().length(6).pattern(/^\d+$/).required()
    // });
    
    // Function to generate 6-digit OTP
    function generateOTP() {
      return Math.floor(100000 + Math.random() * 900000).toString();
    }
    
    // Nodemailer transporter setup
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "gansh3764@gmail.com",
        pass: process.env.PASS // Use environment variable for security
      }
    });
    
    // Route: Send OTP
   
      const { error, value } = emailSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    
      const email = value.email;
      const otp = generateOTP();
      const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    
      otpStore[email] = { otp, expiry };
    
      const mailOptions = {
        from: `"OTP Service" <gansh3764@gmail.com>`,
        to: email,
        subject: 'Your OTP Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h1> AI career navigator </h1>
            <h2>OTP Verification</h2>
            <p>Use the following OTP to verify your email:</p>
            <h1 style="background-color: #f1f1f1; padding: 10px; width: fit-content;">${otp}</h1>
            <p>This OTP is valid for <strong>5 minutes</strong>.</p>
            <p>Thanks for <strong>registration</strong>.</p>
            <p>if you have any query contact our support team <strong>anshgupta911821@gmail.com</strong> </p>
            <p style="font-size: 12px; color: gray;">If you didn’t request this, you can safely ignore it.</p>
          </div>
        `
      };
       
    
    
      try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'OTP sent to email' });
      } catch (err) {
        res.status(500).json({ error: 'Failed to send OTP', details: err.message });
      }
    
    
    // Route: Verify OTP
  
    
}
export { emailVerification };


