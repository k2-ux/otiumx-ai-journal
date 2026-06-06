import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

export const transcribeAudio = onCall(
  { secrets: [GEMINI_API_KEY] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Login required.");
    }

    const apiKey = GEMINI_API_KEY.value();
    if (!apiKey) {
      throw new HttpsError("internal", "Gemini API key missing");
    }

    const audioBase64 = request.data.audio;
    const language: string = request.data.language || "english";

    if (!audioBase64) {
      throw new HttpsError("invalid-argument", "Audio not provided");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "audio/webm",
          data: audioBase64,
        },
      },
      {
        text: `Transcribe this audio accurately. The speaker is speaking in ${language}. Return only the transcript text, nothing else.`,
      },
    ]);

    const text = result.response.text();

    return { text };
  },
);
