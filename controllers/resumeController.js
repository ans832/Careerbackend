import OpenAI from 'openai';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import fs from 'fs';

// Initialize OpenAI with OpenRouter
const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

// Multer setup
const upload = multer({ dest: 'uploads/' });

const uploadResume = [
    upload.single('resume'), // expects "resume" field in frontend form-data
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "No file uploaded." });
            }

            const dataBuffer = fs.readFileSync(req.file.path);
            const pdfData = await pdfParse(dataBuffer);
            const resumeText = pdfData.text.slice(0, 4000); // truncate to prevent token overflow

            const prompt = `
You are an expert career counselor and resume reviewer.
Analyze the following resume content:

"${resumeText}"

Provide:
• Main mistakes found (grammar, clarity, structure).
• How to improve it practically.
• Skills the candidate should learn to improve job prospects.
• Whether the resume is ATS-friendly or not.
• Jobs in India that are suitable for this candidate.
Keep the response under 120 words with clear bullet points.
`;

            const aiResponse = await openai.chat.completions.create({
                model: "deepseek/deepseek-r1-0528:free",
                messages: [
                    {
                        role: "system",
                        content: "You are a precise, helpful resume evaluation bot providing actionable, clear feedback."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            });

            // Clean up the uploaded file
            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupErr) {
                console.error("Error deleting file:", cleanupErr);
            }

            res.json({
                response: aiResponse.choices[0].message.content.trim()
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message || "Internal Server Error" });
        }
    }
];

export { uploadResume };

