import {
  doc,
  setDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
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
  async getEntries(
    userId: string,
    pageSize = 5,
    lastDoc?: QueryDocumentSnapshot,
  ): Promise<{
    entries: JournalEntry[];
    lastDoc?: QueryDocumentSnapshot;
  }> {
    const entriesRef = collection(db, "users", userId, "journalEntries");

    const q = lastDoc
      ? query(
          entriesRef,
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(pageSize),
        )
      : query(entriesRef, orderBy("createdAt", "desc"), limit(pageSize));

    const snapshot = await getDocs(q);

    const entries = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<JournalEntry, "id">),
    }));

    return {
      entries,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
    };
  }
}
