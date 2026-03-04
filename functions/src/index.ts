import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import admin from "firebase-admin";
import { selfAnalysisFlow } from "./ai.js";
export { transcribeAudio } from "./transcribe.js";
// const demoEntries = [
//   {
//     moodScore: 6,
//     content:
//       "Worked on my React Native app today. Felt stuck debugging Firebase but eventually solved it.",
//   },
//   {
//     moodScore: 5,
//     content:
//       "Low energy today. Spent time watching tutorials instead of building. Felt slightly guilty.",
//   },
//   {
//     moodScore: 7,
//     content:
//       "Made good progress on the Genkit integration. Feeling optimistic about the project.",
//   },
//   {
//     moodScore: 6,
//     content: "Exercise helped my focus today. Coding session felt smoother.",
//   },
//   {
//     moodScore: 5,
//     content:
//       "Procrastinated in the morning but recovered later and worked on backend functions.",
//   },
//   {
//     moodScore: 7,
//     content:
//       "Interesting insight today: building projects teaches more than tutorials.",
//   },
//   {
//     moodScore: 6,
//     content:
//       "Thinking about long-term career direction. Considering deeper backend + AI skills.",
//   },
// ];

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");
// ===== DEMO DATA (for recruiter demo) =====

// Prevent multiple initializations during hot reloads
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export const generateInsightReport = onCall(
  { secrets: [GEMINI_API_KEY] },
  async (request) => {
    try {
      // 🔐 Ensure user is authenticated
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "Login required.");
      }

      const userId = request.auth.uid;

      // 🔑 Retrieve Gemini API key from Secret Manager
      const geminiKey = GEMINI_API_KEY.value();

      if (!geminiKey) {
        throw new HttpsError("internal", "Gemini API key not available.");
      }

      // 📖 Fetch last 7 journal entries
      const journalRef = db
        .collection("users")
        .doc(userId)
        .collection("journalEntries");

      const snapshot = await journalRef
        .where("evaluated", "==", false)
        .orderBy("createdAt", "asc")
        .limit(7)
        .get();

      if (snapshot.size < 7) {
        throw new HttpsError(
          "failed-precondition",
          "You can generate an insight report only after 7 new journal entries.",
        );
      }

      // 🧠 Combine entries into one analysis text block
      const dynamicJournalText = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return `Mood: ${data.moodScore}\nEntry: ${data.content}`;
        })
        .join("\n\n");
      // const demoJournalText = demoEntries
      //   .map((entry) => `Mood: ${entry.moodScore}\nEntry: ${entry.content}`)
      //   .join("\n\n");
      const journalText = dynamicJournalText;
      // const journalText = demoJournalText;
      // 🤖 Run AI analysis
      const analysis = await selfAnalysisFlow({
        journalText,
        geminiKey,
      });
      const batch = db.batch();

      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { evaluated: true });
      });

      await batch.commit();
      // 💾 Save report
      const reportRef = await db
        .collection("users")
        .doc(userId)
        .collection("insightReports")
        .add({
          ...analysis,
          generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      // 📤 Return result to client
      return {
        reportId: reportRef.id,
        ...analysis,
      };
    } catch (error: any) {
      console.error("generateInsightReport error:", error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError("internal", "Failed to generate insight report.");
    }
  },
);
