import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface MedicalDevice {
  deviceCode: string;
  deviceName: string;
  lastChecked: any;
  rental: string;
  quantity: number;
  status: string;
  kind: string;
  unit: string;
  createdAt: any;
  updatedAt: any;
}

export const getMedicalDevices = async (): Promise<MedicalDevice[]> => {
  const devicesRef = collection(db, "medical_devices");
  const querySnapshot = await getDocs(devicesRef);
  return querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as MedicalDevice & { id: string });
};

export const addMedicalDevice = async (device: Omit<MedicalDevice, "createdAt" | "updatedAt">) => {
  const now = new Date();
  return await addDoc(collection(db, "medical_devices"), {
    ...device,
    createdAt: now,
    updatedAt: now,
  });
};

export const updateMedicalDevice = async (id: string, device: Partial<MedicalDevice>) => {
  return await updateDoc(doc(db, "medical_devices", id), {
    ...device,
    updatedAt: new Date(),
  });
};

export const deleteMedicalDevice = async (id: string) => {
  return await deleteDoc(doc(db, "medical_devices", id));
}; 