import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  dosage: string;
  form: string; // tablet, syrup, injection, etc.
  stockQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  unit: string;
  price: number;
  expiryDate: string;
  batchNumber: string;
  status: "available" | "low_stock" | "out_of_stock" | "expired";
  description?: string;
  sideEffects?: string;
  contraindications?: string;
  storage?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MedicineUsage {
  id: string;
  medicineId: string;
  medicineName: string;
  studentId: string;
  studentName: string;
  grade: string;
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
  prescribedBy: string;
  givenBy: string;
  reason: string;
  usageDate: string;
  status: "prescribed" | "dispensed" | "completed";
  notes?: string;
  createdAt: Timestamp;
}

// Get all medicines
export const getMedicines = async (): Promise<Medicine[]> => {
  try {
    const medicinesRef = collection(db, "medicines");
    const q = query(medicinesRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Medicine[];
  } catch (error) {
    console.error("Error getting medicines:", error);
    throw error;
  }
};

// Get medicines with real-time updates
export const subscribeToMedicines = (
  callback: (medicines: Medicine[]) => void
) => {
  const medicinesRef = collection(db, "medicines");
  const q = query(medicinesRef, orderBy("createdAt", "desc"));

  return onSnapshot(q, (querySnapshot) => {
    const medicines = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Medicine[];
    callback(medicines);
  });
};

// Add new medicine
export const addMedicine = async (medicineData: {
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  dosage: string;
  form: string;
  stockQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  unit: string;
  price: number;
  expiryDate: string;
  batchNumber: string;
  status: Medicine["status"];
  description?: string;
  sideEffects?: string;
  contraindications?: string;
  storage?: string;
}): Promise<string> => {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, "medicines"), {
      ...medicineData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding medicine:", error);
    throw error;
  }
};

// Update medicine
export const updateMedicine = async (
  id: string,
  updates: Partial<Omit<Medicine, "id" | "createdAt">>
): Promise<void> => {
  try {
    const medicineRef = doc(db, "medicines", id);
    await updateDoc(medicineRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating medicine:", error);
    throw error;
  }
};

// Delete medicine
export const deleteMedicine = async (id: string): Promise<void> => {
  try {
    const medicineRef = doc(db, "medicines", id);
    await deleteDoc(medicineRef);
  } catch (error) {
    console.error("Error deleting medicine:", error);
    throw error;
  }
};

// Update stock quantity
export const updateStockQuantity = async (
  id: string,
  newQuantity: number
): Promise<void> => {
  try {
    const medicineRef = doc(db, "medicines", id);
    await updateDoc(medicineRef, {
      stockQuantity: newQuantity,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating stock quantity:", error);
    throw error;
  }
};

// Get medicines by status
export const getMedicinesByStatus = async (
  status: Medicine["status"]
): Promise<Medicine[]> => {
  try {
    const medicinesRef = collection(db, "medicines");
    const q = query(
      medicinesRef,
      where("status", "==", status),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Medicine[];
  } catch (error) {
    console.error("Error getting medicines by status:", error);
    throw error;
  }
};

// Get medicines by category
export const getMedicinesByCategory = async (
  category: string
): Promise<Medicine[]> => {
  try {
    const medicinesRef = collection(db, "medicines");
    const q = query(
      medicinesRef,
      where("category", "==", category),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Medicine[];
  } catch (error) {
    console.error("Error getting medicines by category:", error);
    throw error;
  }
};

// Search medicines
export const searchMedicines = async (
  searchTerm: string
): Promise<Medicine[]> => {
  try {
    const medicinesRef = collection(db, "medicines");
    const querySnapshot = await getDocs(medicinesRef);

    const medicines = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Medicine[];

    return medicines.filter(
      (medicine) =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error("Error searching medicines:", error);
    throw error;
  }
};

// Get low stock medicines
export const getLowStockMedicines = async (): Promise<Medicine[]> => {
  try {
    const medicinesRef = collection(db, "medicines");
    const q = query(
      medicinesRef,
      where("status", "in", ["low_stock", "out_of_stock"]),
      orderBy("stockQuantity", "asc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Medicine[];
  } catch (error) {
    console.error("Error getting low stock medicines:", error);
    throw error;
  }
};

// Get expired medicines
export const getExpiredMedicines = async (): Promise<Medicine[]> => {
  try {
    const medicinesRef = collection(db, "medicines");
    const q = query(
      medicinesRef,
      where("status", "==", "expired"),
      orderBy("expiryDate", "asc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Medicine[];
  } catch (error) {
    console.error("Error getting expired medicines:", error);
    throw error;
  }
};

// Medicine Usage Functions
export const getMedicineUsage = async (): Promise<MedicineUsage[]> => {
  try {
    const usageRef = collection(db, "medicine_usage");
    const q = query(usageRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as MedicineUsage[];
  } catch (error) {
    console.error("Error getting medicine usage:", error);
    throw error;
  }
};

export const addMedicineUsage = async (
  usageData: Omit<MedicineUsage, "id" | "createdAt">
): Promise<string> => {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, "medicine_usage"), {
      ...usageData,
      createdAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding medicine usage:", error);
    throw error;
  }
};

// Utility function to calculate medicine status
export const calculateMedicineStatus = (medicine: {
  stockQuantity: number;
  minStockLevel: number;
  expiryDate: string;
}): Medicine["status"] => {
  const today = new Date();
  const expiryDate = new Date(medicine.expiryDate);

  // Check if expired
  if (expiryDate < today) {
    return "expired";
  }

  // Check stock levels
  if (medicine.stockQuantity === 0) {
    return "out_of_stock";
  }

  if (medicine.stockQuantity <= medicine.minStockLevel) {
    return "low_stock";
  }

  return "available";
};

// Initialize medicines collection with sample data
export const initializeMedicines = async (): Promise<void> => {
  try {
    const sampleMedicines = [
      {
        name: "Paracetamol",
        genericName: "Acetaminophen",
        category: "analgesic",
        manufacturer: "Traphaco",
        dosage: "500mg",
        form: "tablet",
        stockQuantity: 150,
        minStockLevel: 50,
        maxStockLevel: 500,
        unit: "viên",
        price: 500,
        expiryDate: "2025-12-31",
        batchNumber: "PCT-2024-001",
        description: "Thuốc giảm đau, hạ sốt",
        sideEffects: "Ít tác dụng phụ khi dùng đúng liều",
        contraindications: "Không dùng cho người dị ứng với paracetamol",
        storage: "Nơi khô ráo, thoáng mát",
      },
      {
        name: "Betadine",
        genericName: "Povidone Iodine",
        category: "antiseptic",
        manufacturer: "Mundipharma",
        dosage: "10%",
        form: "solution",
        stockQuantity: 25,
        minStockLevel: 30,
        maxStockLevel: 100,
        unit: "chai",
        price: 35000,
        expiryDate: "2025-06-30",
        batchNumber: "BET-2024-002",
        description: "Dung dịch sát khuẩn",
        sideEffects: "Có thể gây kích ứng da nhẹ",
        contraindications: "Không dùng cho người dị ứng iodine",
        storage: "Tránh ánh sáng trực tiếp",
      },
      {
        name: "Vitamin C",
        genericName: "Ascorbic Acid",
        category: "vitamin",
        manufacturer: "Dhg Pharma",
        dosage: "1000mg",
        form: "tablet",
        stockQuantity: 0,
        minStockLevel: 100,
        maxStockLevel: 1000,
        unit: "viên",
        price: 200,
        expiryDate: "2024-03-31",
        batchNumber: "VTC-2023-003",
        description: "Vitamin C tăng cường sức đề kháng",
        sideEffects: "Có thể gây rối loạn tiêu hóa khi dùng quá liều",
        contraindications: "Không dùng cho người sỏi thận",
        storage: "Nơi khô ráo, nhiệt độ thường",
      },
    ];

    for (const medicine of sampleMedicines) {
      const status = calculateMedicineStatus(medicine);
      await addMedicine({ ...medicine, status });
    }

    console.log("✅ Medicines initialized successfully");
  } catch (error) {
    console.error("Error initializing medicines:", error);
    throw error;
  }
};
