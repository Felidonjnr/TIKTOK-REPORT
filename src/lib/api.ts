import { collection, addDoc, query, where, getDocs, orderBy, doc, deleteDoc, updateDoc, limit } from "firebase/firestore";
import { db } from "./firebase";
import { Entry, ExtractedData } from "../types";

const ENTRIES_COL = "entries";

export async function extractFromScreenshots(files: File[]): Promise<ExtractedData> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("screenshots", file);
  }

  const res = await fetch("/api/extract", {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    let errorMsg = "Failed to extract data";
    try {
      const error = await res.json();
      if (error && error.error) errorMsg = error.error;
    } catch (e) {
      errorMsg = `Server error (${res.status}): Please ensure images are not too large.`;
    }
    throw new Error(errorMsg);
  }

  try {
    return await res.json();
  } catch (e) {
    throw new Error("Failed to parse successful response as JSON. Please try again.");
  }
}

export async function saveEntry(entry: Omit<Entry, "id" | "created_at">): Promise<Entry> {
  const newEntry = {
    ...entry,
    created_at: Date.now()
  };
  
  const docRef = await addDoc(collection(db, ENTRIES_COL), newEntry);
  return { ...newEntry, id: docRef.id } as Entry;
}

export async function getEntries(startDate: string, endDate: string): Promise<Entry[]> {
  const q = query(
    collection(db, ENTRIES_COL),
    where("date", ">=", startDate),
    where("date", "<=", endDate),
    orderBy("date", "desc"),
    orderBy("created_at", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Entry));
}

export async function getCycleInfo(teamMember: string) {
  const resetQ = query(
    collection(db, "cycle_resets"),
    where("team_member", "==", teamMember),
    orderBy("reset_at", "desc"),
    limit(1)
  );
  const resetSnap = await getDocs(resetQ);
  const lastReset = resetSnap.empty ? 0 : resetSnap.docs[0].data().reset_at;

  const entriesQ = query(
    collection(db, ENTRIES_COL),
    where("team_member", "==", teamMember),
    where("created_at", ">=", lastReset)
  );
  
  const entriesSnap = await getDocs(entriesQ);
  return {
    count: entriesSnap.size,
    lastReset
  };
}

export async function resetCycle(teamMember: string) {
  await addDoc(collection(db, "cycle_resets"), {
    team_member: teamMember,
    reset_at: Date.now()
  });
}

export async function getRecentEntries(max: number = 20): Promise<Entry[]> {
  const q = query(
    collection(db, ENTRIES_COL),
    orderBy("created_at", "desc"),
    limit(max)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Entry));
}

export async function deleteEntry(id: string): Promise<void> {
  await deleteDoc(doc(db, ENTRIES_COL, id));
}

export async function updateEntry(id: string, data: Partial<Entry>): Promise<void> {
  await updateDoc(doc(db, ENTRIES_COL, id), data);
}
