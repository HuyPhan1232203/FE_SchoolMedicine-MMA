// Initialize Medicines Data
// Run: node scripts/initializeMedicines.js

const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  Timestamp,
  addDoc,
  collection,
} = require("firebase/firestore");

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBf-SjBgQpScgPOvdTXa9Viu3refqrfh34",
  authDomain: "mma-297bc.firebaseapp.com",
  databaseURL:
    "https://mma-297bc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mma-297bc",
  storageBucket: "mma-297bc.firebasestorage.app",
  messagingSenderId: "275882095501",
  appId: "1:275882095501:web:42aa23de207031090143c4",
  measurementId: "G-MZ7P1598DH",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample medicines data
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
    status: "available",
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
    status: "low_stock",
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
    status: "out_of_stock",
    description: "Vitamin C tăng cường sức đề kháng",
    sideEffects: "Có thể gây rối loạn tiêu hóa khi dùng quá liều",
    contraindications: "Không dùng cho người sỏi thận",
    storage: "Nơi khô ráo, nhiệt độ thường",
  },
  {
    name: "Amoxicillin",
    genericName: "Amoxicillin",
    category: "antibiotic",
    manufacturer: "Stada",
    dosage: "500mg",
    form: "capsule",
    stockQuantity: 80,
    minStockLevel: 20,
    maxStockLevel: 200,
    unit: "viên",
    price: 1500,
    expiryDate: "2025-08-15",
    batchNumber: "AMX-2024-004",
    status: "available",
    description: "Thuốc kháng sinh điều trị nhiễm khuẩn",
    sideEffects: "Có thể gây rối loạn tiêu hóa, dị ứng",
    contraindications: "Không dùng cho người dị ứng penicillin",
    storage: "Nơi khô ráo, tránh ánh sáng",
  },
  {
    name: "Ibuprofen",
    genericName: "Ibuprofen",
    category: "analgesic",
    manufacturer: "Sanofi",
    dosage: "400mg",
    form: "tablet",
    stockQuantity: 120,
    minStockLevel: 40,
    maxStockLevel: 300,
    unit: "viên",
    price: 800,
    expiryDate: "2025-10-20",
    batchNumber: "IBU-2024-005",
    status: "available",
    description: "Thuốc giảm đau, chống viêm",
    sideEffects: "Có thể gây đau dạ dày",
    contraindications: "Không dùng cho người loét dạ dày",
    storage: "Nơi khô ráo, nhiệt độ thường",
  },
];

// Sample medicine usage data
const sampleUsage = [
  {
    medicineId: "1",
    medicineName: "Paracetamol",
    studentId: "HS001",
    studentName: "Nguyễn Văn An",
    grade: "10A1",
    quantity: 2,
    dosage: "500mg",
    frequency: "2 lần/ngày",
    duration: "3 ngày",
    prescribedBy: "Bác sĩ Lê Thị C",
    givenBy: "Y tá Nguyễn Thị A",
    reason: "Sốt cao",
    usageDate: "2024-01-15",
    status: "completed",
    notes: "Đã hết sốt sau 2 ngày",
  },
  {
    medicineId: "2",
    medicineName: "Betadine",
    studentId: "HS002",
    studentName: "Trần Thị Bình",
    grade: "11A2",
    quantity: 1,
    dosage: "10%",
    frequency: "3 lần/ngày",
    duration: "5 ngày",
    prescribedBy: "Y tá Trần Văn B",
    givenBy: "Y tá Trần Văn B",
    reason: "Vết thương nhỏ",
    usageDate: "2024-01-16",
    status: "dispensed",
    notes: "Rửa vết thương và băng bó",
  },
];

async function initializeMedicines() {
  console.log("🏥 Initializing Medicines Data...\n");

  try {
    // Add medicines
    console.log("📦 Adding medicines...");
    for (const medicine of sampleMedicines) {
      const now = Timestamp.now();
      await addDoc(collection(db, "medicines"), {
        ...medicine,
        createdAt: now,
        updatedAt: now,
      });
      console.log(`   ✅ Added: ${medicine.name}`);
    }

    // Add medicine usage
    console.log("\n📋 Adding medicine usage...");
    for (const usage of sampleUsage) {
      const now = Timestamp.now();
      await addDoc(collection(db, "medicine_usage"), {
        ...usage,
        createdAt: now,
      });
      console.log(
        `   ✅ Added usage: ${usage.medicineName} for ${usage.studentName}`
      );
    }

    console.log("\n🎉 Medicines initialization completed!");
    console.log(`📊 Total medicines: ${sampleMedicines.length}`);
    console.log(`📊 Total usage records: ${sampleUsage.length}`);
  } catch (error) {
    console.error("❌ Error initializing medicines:", error);
  }
}

// Run initialization
initializeMedicines();
