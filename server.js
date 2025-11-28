require('dotenv').config();
const express = require('express');
const app = express();
const { GoogleGenAI } = require('@google/genai');

app.use(express.json());

const GEMINI_KEYS = [
    process.env.GEMINI_KEY_0,
    process.env.GEMINI_KEY_1,
    process.env.GEMINI_KEY_2,
   
].filter(key => key);

if (GEMINI_KEYS.length === 0) {
    console.error("CRITICAL ERROR: No Gemini API keys found in environment variables (GEMINI_KEY_0, GEMINI_KEY_1, etc.).");
}

const generateContentWithFailover = async (prompt, modelName = 'gemini-2.5-flash') => {
    let lastError = null;
    
    for (let i = 0; i < GEMINI_KEYS.length; i++) {
        const currentKey = GEMINI_KEYS[i];
        
        try {
            const ai = new GoogleGenAI({ apiKey: currentKey });
            
            const response = await ai.models.generateContent({
                model: modelName,
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
            });
            
            return response.text;
            
        } catch (error) {
            lastError = error;

            if (error.status === 429) {
                console.error(`Attempt with Key ${i} failed (429 Quota Exceeded). Trying next key.`);
                continue;
            }
            
            console.error(`Attempt with Key ${i} failed. Status: ${error.status || 'Unknown'}. Stopping rotation.`);
            break;
        }
    }
    
    if (lastError && lastError.status === 429) {
        throw { status: 429, message: 'All API keys are currently exhausted. Please try again later.' };
    }
    
    throw { status: lastError ? lastError.status || 500 : 500, message: 'Failed to communicate with the AI model.' };
};

const generateContent = async (prompt) => {
    return generateContentWithFailover(prompt, 'gemini-2.5-flash');
};

app.post('/api/ask', async (req, res) => {
    const userQuestion = req.body.question;
    
    if (!userQuestion) {
        return res.status(400).json({ error: 'Question is required.' });
    }

    try {
        const responseText = await generateContentWithFailover(userQuestion, 'gemini-2.5-flash');

        res.json({ 
            answer: responseText 
        });

    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});

app.get('/api/joke', async (req, res) => {
    try {
        const prompt = "Generate a short, funny, family-friendly joke.";
        const joke = await generateContent(prompt);
        res.json({ content: joke });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});

app.get('/api/motivation', async (req, res) => {
    try {
        const prompt = "Generate a concise, powerful motivational quote suitable for a tip of the day.";
        const quote = await generateContent(prompt);
        res.json({ content: quote });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});

app.get('/api/tip-of-the-day', async (req, res) => {
    try {
        const prompt = "Provide one useful, actionable productivity tip for the day.";
        const tip = await generateContent(prompt);
        res.json({ content: tip });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});