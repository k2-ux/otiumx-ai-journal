import { FirebaseAuthService } from "@/services/firebase/authService";
import { FirebaseJournalService } from "@/services/firebase/journalService";
import { FirebaseReportService } from "@/services/firebase/reportService";

export const services = {
  authService: new FirebaseAuthService(),
  journalService: new FirebaseJournalService(),
  reportService: new FirebaseReportService(),
};
