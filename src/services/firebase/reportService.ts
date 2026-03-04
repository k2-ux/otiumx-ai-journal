import { functions } from "@/firebase/functions";
import type { IReportService } from "../interfaces/IReportService";
import { httpsCallable } from "@firebase/functions";

export class FirebaseReportService implements IReportService {
  async generateReport() {
    const callable = httpsCallable(functions, "generateInsightReport");
    const result = await callable({});
    return result.data;
  }
}
