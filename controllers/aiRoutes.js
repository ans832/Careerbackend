import OpenAI from 'openai';
import Session from '../model/sessionModel.js';

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
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
    const sessionId = req.body.sessionId || 'default';
    const userInput = req.body.message?.toLowerCase().trim() || '';
    let session = await Session.findOne({ sessionId });
    if (!session) session = await Session.create({ sessionId });

    let response = '';

    try {
        console.log("==== Incoming Request ====");
        console.log("Session:", sessionId);
        console.log("State:", session.state);
        console.log("User Input:", userInput);
        console.log("==========================");

        if (session.state === "greeting") {
            if (userInput.includes("yes")) {
                session.state = "collectingAnswers";
                await session.save();
                response = "Great! Please answer with yes/no for each:\n" +
                    quizQuestions.map(q => `${q.id}. ${q.question}`).join("\n");
            } else {
                response = `Hi there, ready to take a short career test? (yes/no)`;
            }
        } else if (session.state === "collectingAnswers") {
            const answers = userInput.split(',').map(a => a.trim().toLowerCase());
            if (answers.length === 10 && answers.every(a => a === "yes" || a === "no")) {
                session.userAnswers = answers;
                await session.save();

                const prompt = `
Based on these 10 yes/no quiz answers: ${answers.join(', ')},
provide a short, direct career recommendation:
List:
• Single career path
• Exact next steps
• Technologies/skills to learn first
• Job titles to target
• Where to find job opportunities
• Salary expectations as fresher
• Best companies to target in India
• Any certifications needed
Keep it under 100 words, clear bullet points, no filler.
`;

                const aiResponse = await openai.chat.completions.create({
                    model: "deepseek/deepseek-r1-0528:free",
                    messages: [
                        { role: "system", content: "You are a concise career counselor AI." },
                        { role: "user", content: prompt }
                    ]
                });

                response = aiResponse.choices[0].message.content.trim();
                session.state = "greeting";
                session.userAnswers = [];
                await session.save();
            } else {
                response = "❌ Please answer all 10 questions with 'yes' or 'no', separated by commas.";
            }
        }

        console.log("✅ AI Response:", response);
        res.json({ response });

    } catch (error) {
        console.error("🔥 Error:", error);
        if (error.response) console.error(error.response.data);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

export { aiChatController };
