'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting eco-friendly alternatives to websites.
 *
 * - suggestEcoFriendlyAlternatives - A function that takes a website URL and returns suggestions for reducing carbon footprint and alternative websites.
 * - SuggestEcoFriendlyAlternativesInput - The input type for the suggestEcoFriendlyAlternatives function.
 * - SuggestEcoFriendlyAlternativesOutput - The return type for the suggestEcoFriendlyAlternatives function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {calculateWebsiteCarbonFootprint} from '@/services/website-carbon-footprint';

const SuggestEcoFriendlyAlternativesInputSchema = z.object({
  websiteUrl: z.string().describe('The URL of the website to analyze.'),
});
export type SuggestEcoFriendlyAlternativesInput = z.infer<
  typeof SuggestEcoFriendlyAlternativesInputSchema
>;

const SuggestEcoFriendlyAlternativesOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('Suggestions for reducing carbon footprint on the website.'),
  alternativeWebsites: z
    .array(z.string())
    .describe('Alternative, more eco-friendly websites.'),
});
export type SuggestEcoFriendlyAlternativesOutput = z.infer<
  typeof SuggestEcoFriendlyAlternativesOutputSchema
>;

export async function suggestEcoFriendlyAlternatives(
  input: SuggestEcoFriendlyAlternativesInput
): Promise<SuggestEcoFriendlyAlternativesOutput> {
  return suggestEcoFriendlyAlternativesFlow(input);
}

const ecoFriendlySuggestionsPrompt = ai.definePrompt({
  name: 'ecoFriendlySuggestionsPrompt',
  input: {
    schema: z.object({
      websiteUrl: z.string().describe('The URL of the website to analyze.'),
      carbonFootprintScore: z
        .number()
        .describe('The carbon footprint score of the website.'),
      calculationNotes: z
        .string()
        .describe('Notes on how the carbon footprint was calculated.'),
    }),
  },
  output: {
    schema: z.object({
      suggestions: z
        .array(z.string())
        .describe('Suggestions for reducing carbon footprint on the website.'),
      alternativeWebsites: z
        .array(z.string())
        .describe('Alternative, more eco-friendly websites.'),
    }),
  },
  prompt: `You are an AI assistant that provides suggestions for reducing carbon footprint based on a website's energy consumption.

  Website URL: {{{websiteUrl}}}
  Carbon Footprint Score: {{{carbonFootprintScore}}}
  Calculation Notes: {{{calculationNotes}}}

  Provide suggestions for reducing the carbon footprint of this website and suggest alternative, more eco-friendly websites.
  Format each suggestion as a single sentence.
  Include at least three suggestions.
  Include at least two alternative websites, if available.
  Do not include a disclaimer.
  `,
});

const suggestEcoFriendlyAlternativesFlow = ai.defineFlow<
  typeof SuggestEcoFriendlyAlternativesInputSchema,
  typeof SuggestEcoFriendlyAlternativesOutputSchema
>({
  name: 'suggestEcoFriendlyAlternativesFlow',
  inputSchema: SuggestEcoFriendlyAlternativesInputSchema,
  outputSchema: SuggestEcoFriendlyAlternativesOutputSchema,
},
async input => {
  const carbonFootprintData = await calculateWebsiteCarbonFootprint(
    input.websiteUrl
  );

  const {output} = await ecoFriendlySuggestionsPrompt({
    websiteUrl: input.websiteUrl,
    carbonFootprintScore: carbonFootprintData.carbonFootprintScore,
    calculationNotes: carbonFootprintData.calculationNotes,
  });
  return output!;
});
