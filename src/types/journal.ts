export interface JournalEntry {
  id: string;
  content: string;
  moodScore: number;
  createdAt: string | Date;
  evaluated: boolean;
}
