import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface MedicalEvent {
  eventType: string;
  description: string;
  eventTime: any;
  fullName: string;
  grade: string;
  notes: string;
  reportedBy: string;
  studentId: string;
  createdAt: any;
}

export const getMedicalEvents = async (): Promise<(MedicalEvent & { id: string })[]> => {
  const eventsRef = collection(db, "medical_event");
  const querySnapshot = await getDocs(eventsRef);
  return querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as MedicalEvent & { id: string });
};

export const addMedicalEvent = async (event: Omit<MedicalEvent, "createdAt">) => {
  const now = new Date();
  return await addDoc(collection(db, "medical_event"), {
    ...event,
    createdAt: now,
  });
};

export const updateMedicalEvent = async (id: string, event: Partial<MedicalEvent>) => {
  return await updateDoc(doc(db, "medical_event", id), {
    ...event,
  });
};

export const deleteMedicalEvent = async (id: string) => {
  return await deleteDoc(doc(db, "medical_event", id));
}; 