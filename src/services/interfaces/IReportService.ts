export interface IReportService {
  generateReport(language: string): Promise<any>;
}
