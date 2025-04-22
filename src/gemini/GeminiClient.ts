import { GoogleGenAI } from "@google/genai";

export function useGeminiClient() {
    const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
    return ai
}