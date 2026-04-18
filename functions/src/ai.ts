import { z } from "zod";

export const selfAnalysisFlow = async ({
  journalText,
  geminiKey,
  language,
}: {
  journalText: string;
  geminiKey: string;
  language: string;
}) => {
  // Lazy-load genkit to avoid deployment timeout
  const { genkit } = await import("genkit");
  const { googleAI } = await import("@genkit-ai/googleai");

  const ai = genkit({
    plugins: [
      googleAI({
        apiKey: geminiKey,
      }),
    ],
    model: "googleai/gemini-2.5-flash",
  });

  const outputSchema = z.object({
    corePatterns: z.array(z.string()),
    careerDirectionSignals: z.array(z.string()),
    mentalWellbeingSignals: z.array(z.string()),
    physicalLifestyleSignals: z.array(z.string()),
    riskFactors: z.array(z.string()),
    growthOpportunities: z.array(z.string()),
    recommendedStrategicFocus: z.string(),
    nextConcreteAction: z.string(),
    compoundingVector: z.string(),
  });

  const { output } = await ai.generate({
    prompt: `
You are a warm, thoughtful friend who happens to be really good at noticing patterns in people's lives.
You've just read someone's journal entries and you want to share what you noticed — gently, honestly, and with genuine care.

IMPORTANT: Write ALL output text (every string value in the JSON) in ${language}.

Your tone is: friendly, conversational, a little poetic but never pretentious. Like the comments under a Sigur Rós video — people being quietly honest about feeling things, no performance, no corporate speak.

Don't be clinical. Don't bullet-point someone's soul. Talk like a human.
If something's unclear or there isn't enough to go on, just say "not much to go on here, honestly" or something equally natural.
Only draw from what's actually in the journals — don't invent things.

Here's what to look for and reflect back:

1. What patterns keep showing up — thoughts, moods, habits that seem to repeat.
2. How they seem to feel about their work or career — excited, drained, somewhere in between?
3. How they're doing emotionally and mentally — what's underneath the surface?
4. Physical stuff — energy levels, sleep, how their body seems to be doing.
5. Anything that might quietly become a problem if nothing changes.
6. Something genuinely hopeful hiding inside the hard stuff.
7. One direction that could make multiple things better at once.
8. One small, real thing they could actually do in the next 7 days.
9. One habit or shift that, over time, could quietly change everything.

Return strictly this JSON structure:

{
  "corePatterns": string[],
  "careerDirectionSignals": string[],
  "mentalWellbeingSignals": string[],
  "physicalLifestyleSignals": string[],
  "riskFactors": string[],
  "growthOpportunities": string[],
  "recommendedStrategicFocus": string,
  "nextConcreteAction": string,
  "compoundingVector": string
}

Journal Entries:
${journalText}
`,
    output: {
      schema: outputSchema,
    },
    config: {
      temperature: 0.7,
    },
  });

  if (!output) {
    throw new Error("AI analysis failed to produce structured output.");
  }

  return output;
};
