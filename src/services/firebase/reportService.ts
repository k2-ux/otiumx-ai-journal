import { functions } from "@/firebase/functions";
import { db } from "@/firebase/firestore";
import type { IReportService } from "../interfaces/IReportService";
import { httpsCallable } from "@firebase/functions";
import { collection, query, orderBy, limit, getDocs } from "@firebase/firestore";

export class FirebaseReportService implements IReportService {
  async generateReport(language: string) {
    const callable = httpsCallable(functions, "generateInsightReport");
    const result = await callable({ language });
    return result.data;
  }

  async fetchLatestReport(userId: string) {
    const reportsRef = collection(db, "users", userId, "insightReports");
    const q = query(reportsRef, orderBy("generatedAt", "desc"), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    const { generatedAt, ...reportData } = docSnap.data();
    return {
      reportId: docSnap.id,
      ...reportData,
      generatedAt: generatedAt?.toDate().toISOString() ?? null,
    };
  }
}
