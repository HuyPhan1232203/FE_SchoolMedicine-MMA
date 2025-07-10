import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export interface MedicalEvent {
  id: string;
  title: string;
  description: string;
  eventType:
    | "emergency"
    | "routine"
    | "vaccination"
    | "health_check"
    | "outbreak"
    | "other";
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "resolved" | "monitoring" | "closed";
  location: string;
  affectedStudents: string[];
  affectedCount: number;
  startDate: Timestamp;
  endDate?: Timestamp;
  reportedBy: string;
  assignedTo?: string;
  actions: string[];
  notes?: string;
  attachments?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MedicalEventStats {
  total: number;
  active: number;
  resolved: number;
  critical: number;
  thisMonth: number;
}

// Create new medical event
export const createMedicalEvent = async (
  event: Omit<MedicalEvent, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, "medical_events"), {
      ...event,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating medical event:", error);
    throw error;
  }
};

// Get all medical events
export const getMedicalEvents = async (): Promise<MedicalEvent[]> => {
  try {
    const eventsRef = collection(db, "medical_events");
    const q = query(eventsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as MedicalEvent[];
  } catch (error) {
    console.error("Error getting medical events:", error);
    throw error;
  }
};

// Get medical events by status
export const getMedicalEventsByStatus = async (
  status: MedicalEvent["status"]
): Promise<MedicalEvent[]> => {
  try {
    const eventsRef = collection(db, "medical_events");
    const q = query(
      eventsRef,
      where("status", "==", status),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as MedicalEvent[];
  } catch (error) {
    console.error("Error getting medical events by status:", error);
    throw error;
  }
};

// Get medical events by severity
export const getMedicalEventsBySeverity = async (
  severity: MedicalEvent["severity"]
): Promise<MedicalEvent[]> => {
  try {
    const eventsRef = collection(db, "medical_events");
    const q = query(
      eventsRef,
      where("severity", "==", severity),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as MedicalEvent[];
  } catch (error) {
    console.error("Error getting medical events by severity:", error);
    throw error;
  }
};

// Update medical event
export const updateMedicalEvent = async (
  id: string,
  updates: Partial<Omit<MedicalEvent, "id" | "createdAt">>
): Promise<void> => {
  try {
    const eventRef = doc(db, "medical_events", id);
    await updateDoc(eventRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating medical event:", error);
    throw error;
  }
};

// Delete medical event
export const deleteMedicalEvent = async (id: string): Promise<void> => {
  try {
    const eventRef = doc(db, "medical_events", id);
    await deleteDoc(eventRef);
  } catch (error) {
    console.error("Error deleting medical event:", error);
    throw error;
  }
};

// Get medical event statistics
export const getMedicalEventStats = async (): Promise<MedicalEventStats> => {
  try {
    const events = await getMedicalEvents();
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      total: events.length,
      active: events.filter((e) => e.status === "active").length,
      resolved: events.filter((e) => e.status === "resolved").length,
      critical: events.filter((e) => e.severity === "critical").length,
      thisMonth: events.filter((e) => e.startDate.toDate() >= thisMonth).length,
    };
  } catch (error) {
    console.error("Error getting medical event stats:", error);
    throw error;
  }
};

// Initialize sample medical events
export const initializeMedicalEvents = async (): Promise<void> => {
  try {
    const sampleEvents: Omit<MedicalEvent, "id" | "createdAt" | "updatedAt">[] =
      [
        {
          title: "Dịch cúm mùa",
          description: "Phát hiện nhiều học sinh có triệu chứng cúm mùa",
          eventType: "outbreak",
          severity: "medium",
          status: "active",
          location: "Toàn trường",
          affectedStudents: ["HS001", "HS002", "HS003"],
          affectedCount: 15,
          startDate: Timestamp.now(),
          reportedBy: "Bác sĩ Lan",
          assignedTo: "Bác sĩ Mai",
          actions: [
            "Cách ly học sinh có triệu chứng",
            "Tăng cường vệ sinh lớp học",
            "Thông báo cho phụ huynh",
          ],
          notes: "Cần theo dõi chặt chẽ và báo cáo hàng ngày",
        },
        {
          title: "Tai nạn trong giờ thể dục",
          description: "Học sinh bị ngã trong giờ học thể dục",
          eventType: "emergency",
          severity: "high",
          status: "resolved",
          location: "Sân thể dục",
          affectedStudents: ["HS004"],
          affectedCount: 1,
          startDate: Timestamp.now(),
          endDate: Timestamp.now(),
          reportedBy: "Giáo viên thể dục",
          assignedTo: "Bác sĩ Hùng",
          actions: [
            "Sơ cứu tại chỗ",
            "Đưa đến bệnh viện",
            "Thông báo phụ huynh",
          ],
          notes: "Học sinh đã được điều trị và xuất viện",
        },
        {
          title: "Tiêm chủng định kỳ",
          description: "Chương trình tiêm chủng vaccine cho học sinh lớp 10",
          eventType: "vaccination",
          severity: "low",
          status: "active",
          location: "Phòng y tế",
          affectedStudents: [],
          affectedCount: 120,
          startDate: Timestamp.now(),
          reportedBy: "Bác sĩ Mai",
          assignedTo: "Bác sĩ Mai",
          actions: [
            "Chuẩn bị vaccine",
            "Lập danh sách học sinh",
            "Thông báo lịch tiêm",
          ],
          notes: "Dự kiến hoàn thành trong 2 tuần",
        },
        {
          title: "Khám sức khỏe định kỳ",
          description: "Khám sức khỏe tổng quát cho học sinh toàn trường",
          eventType: "health_check",
          severity: "low",
          status: "monitoring",
          location: "Phòng y tế",
          affectedStudents: [],
          affectedCount: 500,
          startDate: Timestamp.now(),
          reportedBy: "Bác sĩ Lan",
          assignedTo: "Bác sĩ Lan",
          actions: [
            "Kiểm tra chiều cao, cân nặng",
            "Đo huyết áp",
            "Khám mắt, tai, mũi, họng",
          ],
          notes: "Đang tiến hành theo lịch",
        },
      ];

    for (const event of sampleEvents) {
      await createMedicalEvent(event);
    }

    console.log("✅ Medical events initialized successfully");
  } catch (error) {
    console.error("Error initializing medical events:", error);
    throw error;
  }
};
