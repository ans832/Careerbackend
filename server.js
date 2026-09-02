import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routers/authRoutes.js';
import connectDB from './database/mongo.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.post('/', (req, res) => {
  res.send("Hello World");
});

// API ROUTES
app.use('/api', router);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

async function startServer() {
  try {
    await connectDB();

    console.log('✅ MongoDB connected');

    app.listen(PORT, () => {
      console.log(`✅ Server running on ${HOST}:${PORT}`);
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

startServer();