import { createAsyncThunk } from "@reduxjs/toolkit";
import type { JournalEntry } from "@/types/journal";

interface ThunkConfig {
  extra: {
    journalService: any;
  };
}

// CREATE ENTRY
export const createEntryThunk = createAsyncThunk<
  JournalEntry,
  { userId: string; date: string; content: string; moodScore: number },
  ThunkConfig
>(
  "journal/createEntry",
  async ({ userId, date, content, moodScore }, { extra }) => {
    await extra.journalService.createEntry(userId, date, content, moodScore);

    return {
      id: date,
      content,
      moodScore,
      createdAt: new Date(),
      evaluated: false,
    };
  },
);

// FETCH ENTRIES

export const fetchEntriesThunk = createAsyncThunk<
  { entries: JournalEntry[] },
  { userId: string },
  ThunkConfig
>("journal/fetchEntries", async ({ userId }, { extra }) => {
  return await extra.journalService.getEntries(userId);
});
