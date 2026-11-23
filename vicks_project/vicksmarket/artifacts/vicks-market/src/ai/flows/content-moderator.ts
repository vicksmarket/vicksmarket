
'use server';
/**
 * @fileOverview AI Content Moderator v2.0 for products.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ModerationInputSchema = z.object({
  text: z.string().describe('The product description to check.'),
});

const ModerationOutputSchema = z.object({
  isAllowed: z.boolean().describe('Whether the content follows the rules.'),
  reason: z.string().optional().describe('Reason for rejection if any.'),
});

export async function moderateContent(text: string) {
  const { output } = await ai.generate({
    system: `أنت مراقب محتوى "فولاذي" لمتجر "Vicks Market". 
    قوانيننا الجديدة صارمة: 
    1. يمنع منعاً باتاً وضع أي رقم هاتف (012..., 011..., 010..., 015...).
    2. يمنع وضع أي روابط خارجية أو أسماء مواقع أخرى.
    3. يمنع الكلمات النابية، التحرش، أو العنصرية.
    4. يمنع الادعاء بأن المنتج "أصلي" وهو مقلد (إذا شككت في النص ارفضه).
    
    حلل النص وأخبرني إذا كان مسموحاً أم لا. لو فيه رقم تليفون قوله "ممنوع التواصل الخارجي يا ملك".`,
    prompt: text,
    output: { schema: ModerationOutputSchema }
  });
  return output!;
}
