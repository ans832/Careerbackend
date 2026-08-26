import mongoose from "mongoose";

const guideSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {                // ✅ unique email per guide
        type: String,
        required: true,
        unique: true,
    },
    expertise: String,
    available: {
        type: Boolean,
        default: true,
    },
});

export default mongoose.model('Guide', guideSchema);
