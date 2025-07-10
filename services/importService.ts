import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export interface ImportTemplate {
  id: string;
  name: string;
  description: string;
  fields: string[];
  example: string;
  icon: string;
  collection: string;
  required: boolean;
}

export interface ImportHistory {
  id: string;
  fileName: string;
  type: string;
  records: number;
  success: number;
  failed: number;
  date: Timestamp;
  status: "completed" | "processing" | "failed";
  errorMessage?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ImportResult {
  success: boolean;
  message: string;
  recordsProcessed: number;
  recordsSuccess: number;
  recordsFailed: number;
  errors?: string[];
}

// Get import templates
export const getImportTemplates = (): ImportTemplate[] => {
  return [
    {
      id: "1",
      name: "Danh sách học sinh",
      description: "Import danh sách học sinh từ file Excel/CSV",
      fields: [
        "Mã học sinh",
        "Họ tên",
        "Lớp",
        "Ngày sinh",
        "Giới tính",
        "Số điện thoại phụ huynh",
      ],
      example: "HS001,Nguyễn Văn An,10A1,15/03/2008,Nam,0901234567",
      icon: "👨‍🎓",
      collection: "students",
      required: true,
    },
    {
      id: "2",
      name: "Danh sách phụ huynh",
      description: "Import thông tin phụ huynh và liên kết với học sinh",
      fields: [
        "Email",
        "Họ tên",
        "Số điện thoại",
        "Địa chỉ",
        "Mã học sinh con",
      ],
      example:
        "nguyenvanan@gmail.com,Nguyễn Văn An,0901234567,123 Đường ABC,HS001",
      icon: "👨‍👩‍👧‍👦",
      collection: "parents",
      required: true,
    },
    {
      id: "3",
      name: "Danh sách cán bộ y tế",
      description: "Import thông tin cán bộ y tế nhà trường",
      fields: ["Email", "Họ tên", "Chức vụ", "Số điện thoại", "Chuyên môn"],
      example:
        "bacsilan@school.edu.vn,Nguyễn Thị Lan,Bác sĩ,0912345678,Nhi khoa",
      icon: "👩‍⚕️",
      collection: "medical_staff",
      required: true,
    },
    {
      id: "4",
      name: "Lịch tiêm chủng",
      description: "Import lịch tiêm chủng cho học sinh",
      fields: ["Mã học sinh", "Tên vaccine", "Ngày tiêm", "Liều số", "Ghi chú"],
      example: "HS001,COVID-19,15/01/2024,1,Liều đầu tiên",
      icon: "💉",
      collection: "vaccinations",
      required: false,
    },
    {
      id: "5",
      name: "Hồ sơ sức khỏe",
      description: "Import hồ sơ khám sức khỏe định kỳ",
      fields: [
        "Mã học sinh",
        "Ngày khám",
        "Chiều cao",
        "Cân nặng",
        "Tình trạng sức khỏe",
      ],
      example: "HS001,20/12/2024,165,55,Khỏe mạnh",
      icon: "📋",
      collection: "health_records",
      required: false,
    },
  ];
};

// Get import history
export const getImportHistory = async (): Promise<ImportHistory[]> => {
  try {
    const historyRef = collection(db, "import_history");
    const q = query(historyRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as ImportHistory[];
  } catch (error) {
    console.error("Error getting import history:", error);
    throw error;
  }
};

// Create import history record
export const createImportHistory = async (
  history: Omit<ImportHistory, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, "import_history"), {
      ...history,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating import history:", error);
    throw error;
  }
};

// Update import history
export const updateImportHistory = async (
  id: string,
  updates: Partial<Omit<ImportHistory, "id" | "createdAt">>
): Promise<void> => {
  try {
    const historyRef = doc(db, "import_history", id);
    await updateDoc(historyRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating import history:", error);
    throw error;
  }
};

// Process CSV data
export const processCSVData = async (
  csvData: string,
  template: ImportTemplate,
  createdBy: string
): Promise<ImportResult> => {
  try {
    const lines = csvData.trim().split("\n");
    const headers = lines[0].split(",");
    const data = lines.slice(1);

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    // Create import history record
    const historyId = await createImportHistory({
      fileName: `import_${template.name}_${
        new Date().toISOString().split("T")[0]
      }.csv`,
      type: template.name,
      records: data.length,
      success: 0,
      failed: 0,
      date: Timestamp.now(),
      status: "processing",
      createdBy,
    });

    // Process each line
    for (let i = 0; i < data.length; i++) {
      try {
        const values = data[i].split(",");
        const record: any = {};

        // Map values to fields
        headers.forEach((header, index) => {
          record[header.trim()] = values[index]?.trim() || "";
        });

        // Add metadata
        record.createdAt = Timestamp.now();
        record.updatedAt = Timestamp.now();
        record.importedBy = createdBy;

        // Save to appropriate collection
        await addDoc(collection(db, template.collection), record);
        success++;
      } catch (error) {
        failed++;
        errors.push(`Line ${i + 2}: ${error}`);
      }
    }

    // Update import history
    await updateImportHistory(historyId, {
      success,
      failed,
      status: failed === 0 ? "completed" : "failed",
      errorMessage: errors.length > 0 ? errors.join("; ") : undefined,
    });

    return {
      success: failed === 0,
      message:
        failed === 0
          ? `Import thành công ${success} bản ghi`
          : `Import hoàn thành với ${success} thành công, ${failed} thất bại`,
      recordsProcessed: data.length,
      recordsSuccess: success,
      recordsFailed: failed,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("Error processing CSV data:", error);
    throw error;
  }
};

// Initialize sample import history
export const initializeImportHistory = async (
  createdBy: string
): Promise<void> => {
  try {
    const sampleHistory: Omit<
      ImportHistory,
      "id" | "createdAt" | "updatedAt"
    >[] = [
      {
        fileName: "danh_sach_hoc_sinh_2024.xlsx",
        type: "Danh sách học sinh",
        records: 350,
        success: 348,
        failed: 2,
        date: Timestamp.now(),
        status: "completed",
        createdBy,
      },
      {
        fileName: "phu_huynh_quy_1.csv",
        type: "Danh sách phụ huynh",
        records: 280,
        success: 275,
        failed: 5,
        date: Timestamp.now(),
        status: "completed",
        createdBy,
      },
      {
        fileName: "lich_tiem_chung.xlsx",
        type: "Lịch tiêm chủng",
        records: 150,
        success: 0,
        failed: 150,
        date: Timestamp.now(),
        status: "failed",
        errorMessage: "Định dạng file không đúng",
        createdBy,
      },
      {
        fileName: "ho_so_suc_khoe.xlsx",
        type: "Hồ sơ sức khỏe",
        records: 200,
        success: 200,
        failed: 0,
        date: Timestamp.now(),
        status: "completed",
        createdBy,
      },
    ];

    for (const history of sampleHistory) {
      await createImportHistory(history);
    }

    console.log("✅ Import history initialized successfully");
  } catch (error) {
    console.error("Error initializing import history:", error);
    throw error;
  }
};
