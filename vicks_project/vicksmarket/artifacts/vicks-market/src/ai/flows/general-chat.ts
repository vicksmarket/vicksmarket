'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { createClient } from '@/utils/supabase/server';

const SYSTEM_PROMPT = `أنت مساعد ذكي لمتجر "فيكس ماركت" (VicksMarket)، سوق مصري متكامل للتسوق الإلكتروني.
مهمتك: مساعدة المستخدمين في إيجاد المنتجات، الإجابة على استفساراتهم، وإرشادهم للخدمات المتاحة.
أسلوبك: ودود، عملي، باللهجة المصرية أو العربية الفصحى المبسطة.
التزم بالإجابات المختصرة المفيدة.`;

interface GeneralChatInput {
  message: string;
  userEmail?: string;
  history?: Array<{ role: 'user' | 'model'; text: string }>;
}

interface GeneralChatOutput {
  response: string;
}

export async function generalChatFlow(input: GeneralChatInput): Promise<GeneralChatOutput> {
  try {
    // Fetch recent products for context (server-side Supabase client is async)
    const supabase = await createClient();
    const { data: products } = await supabase
      .from("products")
      .select("name, price, category, seller")
      .order("createdAt", { ascending: false })
      .limit(10);

    const productContext = products && products.length > 0
      ? `\n\nأحدث المنتجات المتاحة:\n${products.map((p: any) => `- ${p.name}: ${p.price} ج.م (${p.category}) بائع: ${p.seller}`).join('\n')}`
      : '';

    const adminHint = input.userEmail?.toLowerCase().includes('vicksmarket') || input.userEmail?.toLowerCase().includes('mom1113694362')
      ? '\n\nملاحظة: المستخدم الحالي هو أحد مديري المنصة، تعامل بصلاحيات مطلقة.'
      : '';

    const fullSystemPrompt = SYSTEM_PROMPT + productContext + adminHint;

    // Build history for multi-turn context
    const historyMessages = (input.history || []).map(h => ({
      role: h.role,
      content: [{ text: h.text }],
    }));

    const response = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      system: fullSystemPrompt,
      messages: historyMessages,
      prompt: input.message,
      config: { temperature: 0.7, maxOutputTokens: 512 },
    });

    return { response: response.text || "عذراً، لم أتمكن من الإجابة الآن. حاول مرة أخرى." };
  } catch (error) {
    console.error('[generalChatFlow] Error:', error);
    return { response: "عذراً، حدث خطأ تقني. حاول مرة أخرى بعد قليل." };
  }
}

// Genkit flow definition — input/output match what ai-chat/page.tsx expects
const GeneralChatInputSchema = z.object({
  message: z.string(),
  userEmail: z.string().optional(),
  history: z.array(z.object({ role: z.enum(['user', 'model']), text: z.string() })).optional(),
});

const GeneralChatOutputSchema = z.object({
  response: z.string(),
});

export const generalChat = ai.defineFlow(
  {
    name: 'generalChat',
    inputSchema: GeneralChatInputSchema,
    outputSchema: GeneralChatOutputSchema,
  },
  generalChatFlow
);
