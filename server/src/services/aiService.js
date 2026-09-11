const { GoogleGenAI } = require('@google/genai');

const GEMINI_KEYS = [
	process.env.GEMINI_KEY_0,
	process.env.GEMINI_KEY_1,
	process.env.GEMINI_KEY_2,
].filter(Boolean);

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

if (GEMINI_KEYS.length === 0) {
	console.error('CRITICAL ERROR: No Gemini API keys found in environment variables.');
}

const createGeminiClient = (apiKey) => {
	return new GoogleGenAI({ apiKey });
};

const generateContentWithFailover = async (prompt, modelName = DEFAULT_MODEL) => {
	let lastError = null;

	for (let index = 0; index < GEMINI_KEYS.length; index += 1) {
		const apiKey = GEMINI_KEYS[index];

		try {
			const ai = createGeminiClient(apiKey);

			const response = await ai.models.generateContent({
				model: modelName,
				contents: [{ role: 'user', parts: [{ text: prompt }] }],
			});

			return response.text;
		} catch (error) {
			lastError = error;

			if (error.status === 429) {
				continue;
			}

			break;
		}
	}

	if (lastError && lastError.status === 429) {
		throw {
			status: 429,
			message: 'All API keys are currently exhausted. Please try again later.',
		};
	}

	throw {
		status: lastError ? lastError.status || 500 : 500,
		message: 'Failed to communicate with the AI model.',
	};
};

const generateContent = async (prompt) => {
	return generateContentWithFailover(prompt, DEFAULT_MODEL);
};

const generateJoke = async () => {
	return generateContent('Generate a short, funny, family-friendly joke.');
};

const generateMotivation = async () => {
	return generateContent('Generate a concise, powerful motivational quote suitable for a tip of the day.');
};

const generateTipOfTheDay = async () => {
	return generateContent('Provide one useful, actionable productivity tip for the day.');
};

module.exports = {
	generateContent,
	generateJoke,
	generateMotivation,
	generateTipOfTheDay,
};
