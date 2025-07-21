// models/sessionModel.js
import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },
    state: { type: String, default: "greeting" },
    userAnswers: { type: [String], default: [] },
});

export default mongoose.model("Session", sessionSchema);
