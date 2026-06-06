import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { generateReportThunk, fetchLatestReportThunk } from "./reportThunks";

interface ReportState {
  loading: boolean;
  error: string | null;
  latestReport: any | null;
}

const initialState: ReportState = {
  loading: false,
  error: null,
  latestReport: null,
};

const reportSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(generateReportThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateReportThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.latestReport = action.payload;
      })
      .addCase(generateReportThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to generate report";
      })

      // FETCH LATEST REPORT
      .addCase(fetchLatestReportThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLatestReportThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.latestReport = action.payload;
      })
      .addCase(fetchLatestReportThunk.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const selectReports = (state: RootState) => state.reports;

export default reportSlice.reducer;
