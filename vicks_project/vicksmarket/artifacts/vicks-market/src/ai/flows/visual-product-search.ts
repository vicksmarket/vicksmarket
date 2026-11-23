'use server';
/**
 * @fileOverview A Genkit flow for visual product search.
 *
 * - visualProductSearch - A function that handles the visual product search process.
 * - VisualProductSearchInput - The input type for the visualProductSearch function.
 * - VisualProductSearchOutput - The return type for the visualProductSearch function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const VisualProductSearchInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type VisualProductSearchInput = z.infer<typeof VisualProductSearchInputSchema>;

const VisualProductSearchOutputSchema = z.object({
  similarProducts: z
    .array(z.string())
    .describe('A list of descriptions for similar products found based on the input image.'),
});
export type VisualProductSearchOutput = z.infer<typeof VisualProductSearchOutputSchema>;

export async function visualProductSearch(
  input: VisualProductSearchInput
): Promise<VisualProductSearchOutput> {
  return visualProductSearchFlow(input);
}

const visualProductSearchPrompt = ai.definePrompt({
  name: 'visualProductSearchPrompt',
  input: { schema: VisualProductSearchInputSchema },
  output: { schema: VisualProductSearchOutputSchema },
  prompt: `Analyze the provided image of a product and identify its key features such as type, color, material, style, and any notable attributes.
Based on this analysis, provide a list of descriptive names or short descriptions for 3-5 similar products that could be found in an online marketplace.
Each item in the list should clearly state what makes the product similar.

Image: {{media url=photoDataUri}}`,
});

const visualProductSearchFlow = ai.defineFlow(
  {
    name: 'visualProductSearchFlow',
    inputSchema: VisualProductSearchInputSchema,
    outputSchema: VisualProductSearchOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-image'),
      prompt: visualProductSearchPrompt(input),
      config: {
        responseModalities: ['TEXT'],
      },
    });
    return output!;
  }
);
