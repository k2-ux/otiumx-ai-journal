import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

export const transcribeAudio = onCall(
  { secrets: [GEMINI_API_KEY] },
  async (request) => {
    const apiKey = GEMINI_API_KEY.value();
    if (!apiKey) {
      throw new HttpsError("internal", "Gemini API key missing");
    }

    const audioBase64 = request.data.audio;

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
        text: "Transcribe this audio accurately. Return only the transcript text.",
      },
    ]);

    const text = result.response.text();

    return { text };
  },
);
