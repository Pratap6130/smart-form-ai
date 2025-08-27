const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("API key for Gemini AI is not set. Please add it in the environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // Ensure you're using the right model
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json", // Ensures JSON response
};

export const AiChatSession = model.startChat({
  generationConfig,
  history: [], // You can store the conversation history here if required
});

 