import { createAsyncThunk } from "@reduxjs/toolkit";

interface ThunkConfig {
  extra: {
    reportService: any;
  };
}

export const generateReportThunk = createAsyncThunk<
  any,
  { language: string },
  ThunkConfig
>("reports/generate", async ({ language }, { extra }) => {
  return await extra.reportService.generateReport(language);
});

export const fetchLatestReportThunk = createAsyncThunk<
  any,
  { userId: string },
  ThunkConfig
>("reports/fetchLatest", async ({ userId }, { extra }) => {
  return await extra.reportService.fetchLatestReport(userId);
});
