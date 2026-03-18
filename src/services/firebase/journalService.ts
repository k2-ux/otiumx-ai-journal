import {
  doc,
  setDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
} from "@firebase/firestore";

import { db } from "@/firebase/firestore";
import type { IJournalService } from "../interfaces/IJournalService";
import type { JournalEntry } from "@/types/journal";

export class FirebaseJournalService implements IJournalService {
  async createEntry(
    userId: string,
    date: string,
    content: string,
    moodScore: number,
  ): Promise<void> {
    const entryRef = doc(db, "users", userId, "journalEntries", date);

    await setDoc(entryRef, {
      content,
      moodScore,
      createdAt: serverTimestamp(),
      evaluated: false,
    });
  }
  async getEntries(userId: string): Promise<{
    entries: JournalEntry[];
  }> {
    const entriesRef = collection(db, "users", userId, "journalEntries");

    const q = query(entriesRef, orderBy("createdAt", "desc"));

    const snapshot = await getDocs(q);

    const entries = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        content: data.content,
        moodScore: data.moodScore,
        evaluated: data.evaluated ?? false,
        createdAt: data.createdAt?.toDate().toISOString(),
      };
    });

    return { entries };
  }
}
