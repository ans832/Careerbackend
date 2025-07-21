import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routers/authRoutes.js';
import nodeMailer from 'nodemailer';
import connectDB from './database/mongo.js';

import { fileURLToPath } from 'url';

// __dirname fix for ES Modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();

app.use(cors({
    origin: ['http://localhost:5173', 'https://ai-navigator.netlify.app'],
    credentials: true,
}));
app.use(express.json());

// API ROUTES FIRST
app.use('/api', router);

// Serve static files



app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on ${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}`);
});
