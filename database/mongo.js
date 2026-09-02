import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log("MONGO_URI exists:", !!process.env.MONGO_URI);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`✅ MongoDB connected: ${conn.connection.host}`);

        return conn;

    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        throw error;
    }
};

export default connectDB;