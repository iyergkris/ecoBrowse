'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting alternative, more energy-efficient websites.
 *
 * - suggestAlternativeWebsites - A function that suggests alternative websites based on a given website URL.
 * - SuggestAlternativeWebsitesInput - The input type for the suggestAlternativeWebsites function.
 * - SuggestAlternativeWebsitesOutput - The return type for the suggestAlternativeWebsites function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestAlternativeWebsitesInputSchema = z.object({
  websiteUrl: z.string().url().describe('The URL of the website to find alternatives for.'),
  carbonFootprintScore: z.number().describe('The carbon footprint score of the website.'),
});
export type SuggestAlternativeWebsitesInput = z.infer<typeof SuggestAlternativeWebsitesInputSchema>;

const SuggestAlternativeWebsitesOutputSchema = z.object({
  alternatives: z
    .array(
      z.object({
        url: z.string().url().describe('URL of the alternative website.'),
        reason: z.string().describe('Reason why this website is a good alternative.'),
      })
    )
    .describe('A list of alternative websites.'),
  explanation: z.string().describe('Explanation of why those websites are better.'),
});
export type SuggestAlternativeWebsitesOutput = z.infer<typeof SuggestAlternativeWebsitesOutputSchema>;

export async function suggestAlternativeWebsites(input: SuggestAlternativeWebsitesInput): Promise<SuggestAlternativeWebsitesOutput> {
  return suggestAlternativeWebsitesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAlternativeWebsitesPrompt',
  input: {
    schema: z.object({
      websiteUrl: z.string().url().describe('The URL of the website to find alternatives for.'),
      carbonFootprintScore: z.number().describe('The carbon footprint score of the website.'),
    }),
  },
  output: {
    schema: z.object({
      alternatives: z
        .array(
          z.object({
            url: z.string().url().describe('URL of the alternative website.'),
            reason: z.string().describe('Reason why this website is a good alternative.'),
          })
        )
        .describe('A list of alternative websites.'),
      explanation: z.string().describe('Explanation of why those websites are better.'),
    }),
  },
  prompt: `You are an AI assistant designed to suggest alternative, more energy-efficient websites when a given website has a high carbon footprint.

  Website URL: {{{websiteUrl}}}
  Carbon Footprint Score: {{{carbonFootprintScore}}}

  Suggest alternative websites that offer similar content or services but are more energy-efficient.
  Provide a brief explanation of why these alternatives are better in terms of carbon footprint.
  Format your response as a JSON object with "alternatives" and "explanation" fields. The alternatives field is an array of objects containing the url and a short reason. The explanation field gives a more detailed explnation.
  `,
});

const suggestAlternativeWebsitesFlow = ai.defineFlow<
  typeof SuggestAlternativeWebsitesInputSchema,
  typeof SuggestAlternativeWebsitesOutputSchema
>({
  name: 'suggestAlternativeWebsitesFlow',
  inputSchema: SuggestAlternativeWebsitesInputSchema,
  outputSchema: SuggestAlternativeWebsitesOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
