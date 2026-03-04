import type { JournalEntry } from "@/types/journal";

export interface IJournalService {
  createEntry(
    userId: string,
    date: string,
    content: string,
    moodScore: number,
  ): Promise<void>;

  getEntries(
    userId: string,
    pageSize?: number,
    lastDoc?: any,
  ): Promise<{
    entries: JournalEntry[];
    lastDoc?: any;
  }>;
}
