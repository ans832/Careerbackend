
import mongoose from 'mongoose';
import joi from 'joi';


const bookingSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    selectedPlan: {
        type: String,
        required: true,
        enum: ['Standard guidance', 'Deluxe guidance', 'Executive guidance']
    },
    dates: {
        firstDate: {
            type: Date,
            required: true
        },
        lastDate: {
            type: Date,
            required: true
        }
    },
    paymentId: {
        type: String,
        required: true
    },
    guideEmail: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Booking', bookingSchema);
