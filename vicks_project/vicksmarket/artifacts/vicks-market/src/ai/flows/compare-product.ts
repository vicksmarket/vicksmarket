
'use server';
/**
 * @fileOverview A Genkit flow for AI smart product comparison.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CompareInputSchema = z.object({
  productName: z.string().describe('The name of the current product.'),
  currentPrice: z.number().describe('The price of the current product in EGP.'),
  category: z.string().describe('Product category.'),
});

const CompareOutputSchema = z.object({
  marketPriceRange: z.string().describe('Typical price range in the market.'),
  isGoodDeal: z.boolean().describe('Whether this is a good price.'),
  advice: z.string().describe('AI advice about the price and alternatives.'),
  alternatives: z.array(z.string()).describe('List of potential alternative products or brands.'),
});

export async function compareWithMarket(input: z.infer<typeof CompareInputSchema>) {
  const { output } = await ai.generate({
    system: `أنت خبير تسوق ذكي في مصر لمتجر "Vicks Market". 
    مهمتك مقارنة المنتج الحالي بأسعار السوق الحقيقية.
    أعطِ نصيحة صريحة (باللهجة المصرية) إذا كان السعر لقطة أم مرتفع، واقترح بدائل ذكية بنفس السعر.`,
    prompt: `المنتج: ${input.productName}, السعر الحالي: ${input.currentPrice} ج.م, القسم: ${input.category}`,
    output: { schema: CompareOutputSchema }
  });
  return output!;
}
