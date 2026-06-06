export interface IReportService {
  generateReport(language: string): Promise<any>;
  fetchLatestReport(userId: string): Promise<any>;
}
