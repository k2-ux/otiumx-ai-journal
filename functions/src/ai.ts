import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { z } from "zod";

export const selfAnalysisFlow = async ({
  journalText,
  geminiKey,
}: {
  journalText: string;
  geminiKey: string;
}) => {
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
You are a high-resolution strategic life synthesis engine.

You are NOT a therapist.
You are NOT a motivational speaker.
You are an analyst performing structural pattern recognition.

Base all conclusions strictly on observable signals in the journal text.
Do not hallucinate personality traits, diagnoses, or external context.
If data is insufficient for a category, explicitly say "insufficient data".

Analyze the journal entries and return ONLY valid JSON.

Focus on:

1. Recurring behavioral or thinking loops.
2. Signals of career engagement vs disengagement.
3. Mental wellbeing patterns.
4. Physical lifestyle signals (energy, sleep, fatigue).
5. Potential long-term risks if patterns continue.
6. Hidden growth opportunities inside current struggles.
7. One strategic direction that improves multiple life areas.
8. One concrete action that can be executed within the next 7 days.
9. One compounding life vector that improves outcomes over time.

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
      temperature: 0.3,
    },
  });

  if (!output) {
    throw new Error("AI analysis failed to produce structured output.");
  }

  return output;
};
