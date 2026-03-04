import { createAsyncThunk } from "@reduxjs/toolkit";

interface ThunkConfig {
  extra: {
    reportService: any;
  };
}

export const generateReportThunk = createAsyncThunk<any, void, ThunkConfig>(
  "reports/generate",
  async (_, { extra }) => {
    return await extra.reportService.generateReport();
  },
);
