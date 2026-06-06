import { functions } from "@/firebase/functions";
import type { IReportService } from "../interfaces/IReportService";
import { httpsCallable } from "@firebase/functions";

export class FirebaseReportService implements IReportService {
  async generateReport(language: string) {
    const callable = httpsCallable(functions, "generateInsightReport");
    const result = await callable({ language });
    return result.data;
  }
}
