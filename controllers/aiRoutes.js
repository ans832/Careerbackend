import OpenAI from 'openai';
import Session from '../model/sessionModel.js';

// ✅ Correct Groq setup
const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

const quizQuestions = [
    { question: "Do you enjoy solving complex problems?", id: 1 },
    { question: "Do you prefer working in teams over working alone?", id: 2 },
    { question: "Are you interested in technology and coding?", id: 3 },
    { question: "Do you like helping and guiding others?", id: 4 },
    { question: "Are you comfortable speaking or presenting to groups?", id: 5 },
    { question: "Do you enjoy organizing and managing projects?", id: 6 },
    { question: "Do you like working with data and analysis?", id: 7 },
    { question: "Are you interested in creative design or writing?", id: 8 },
    { question: "Do you value job stability over taking risks?", id: 9 },
    { question: "Would you like to build your own business someday?", id: 10 },
];

const aiChatController = async (req, res) => {

    // ✅ FIX 1: unique session (no more "default")
    const sessionId = req.body.sessionId || 'default';

    const userInput = req.body.message?.toLowerCase().trim() || '';

    let session = await Session.findOne({ sessionId });

    // ✅ FIX 2: create session with greeting state
    if (!session) {
        session = await Session.create({
            sessionId,
            state: "greeting",
            userAnswers: []
        });
    }

    let response = '';

    try {

        // ✅ FIX 3: FORCE RESET when user says hi
        if (userInput === "hi" || userInput === "hii") {
            session.state = "greeting";
            session.userAnswers = [];
            await session.save();

            return res.json({
                response: "Hi there 👋 Ready to take a short career test? (yes/no)"
            });
        }

        // ✅ GREETING FLOW
        if (session.state === "greeting") {

            if (userInput.includes("yes")) {
                session.state = "collectingAnswers";
                await session.save();

                response = "Great! Please answer with yes/no for each:\n" +
                    quizQuestions.map(q => `${q.id}. ${q.question}`).join("\n");

            } else {
                response = "Hi there 👋 Ready to take a short career test? (yes/no)";
            }

        }

        // ✅ ANSWER COLLECTION FLOW
        else if (session.state === "collectingAnswers") {

            const answers = userInput.split(',').map(a => a.trim().toLowerCase());

            if (answers.length === 10 && answers.every(a => a === "yes" || a === "no")) {

                session.userAnswers = answers;
                await session.save();

                const prompt = `
Based on these 10 yes/no quiz answers: ${answers.join(', ')},
give a medium length career recommendation on every point:
• Career path
• Skills to learn
• Job roles
• Salary (India fresher)
• Places he apply for jobs
• platform for apply 
Keep under 180 words.
`;

                const aiResponse = await openai.chat.completions.create({
                    model: "openai/gpt-oss-20b", // ✅ stable Groq model
                    messages: [
                        { role: "system", content: "You are a concise career advisor." },
                        { role: "user", content: prompt }
                    ]
                });

                response = aiResponse.choices[0].message.content.trim();

                // ✅ reset after completion
                session.state = "greeting";
                session.userAnswers = [];
                await session.save();

            } else {
                response = "❌ Please answer all 10 questions using yes/no separated by commas.";
            }
        }


        res.json({ response });

    } catch (error) {
        console.error("🔥 Error:", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

export { aiChatController };