// src/lib/geminiClient.ts
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY must be set in your environment');
}

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
