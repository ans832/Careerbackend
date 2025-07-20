import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routers/authRoutes.js';
import nodeMailer from 'nodemailer';
import connectDB from './database/mongo.js';




const app = express();

app.use(cors({
    origin: ['http://localhost:5173', 'https://amazing-marigold-63b0f6.netlify.app/'],
    credentials: true,
}));

app.use(express.json());
dotenv.config();

connectDB();

app.use('/api', router);



app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on ${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}`);
});


