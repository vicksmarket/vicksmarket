
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview الدماغ المركزي للذكاء الاصطناعي في فيكس ماركت.
 * تم تحديثه لاستخدام مفتاح Gemini API من متغيرات البيئة.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});

export { genkit };
