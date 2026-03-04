import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type { JournalEntry } from "@/types/journal";
import { createEntryThunk, fetchEntriesThunk } from "./journalThunks";
interface JournalState {
  entries: Record<string, JournalEntry>;
  loading: boolean;
  error: string | null;
}

const initialState: JournalState = {
  entries: {},
  loading: false,
  error: null,
};

const journalSlice = createSlice({
  name: "journal",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // CREATE ENTRY
      .addCase(createEntryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEntryThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.entries[action.payload.id] = action.payload;
      })
      .addCase(createEntryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create entry";
      })

      // FETCH ENTRIES
      .addCase(fetchEntriesThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEntriesThunk.fulfilled, (state, action) => {
        state.loading = false;

        action.payload.entries.forEach((entry) => {
          state.entries[entry.id] = entry;
        });
      })
      .addCase(fetchEntriesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch entries";
      });
  },
});

export const selectJournal = (state: RootState) => state.journal;

export default journalSlice.reducer;
