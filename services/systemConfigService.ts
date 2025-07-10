import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export interface SchoolInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo?: string;
  description?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  reminderNotifications: boolean;
  emergencyNotifications: boolean;
}

export interface SystemSettings {
  allowSelfRegistration: boolean;
  requireEmailVerification: boolean;
  autoApproveParents: boolean;
  maintenanceMode: boolean;
  maxFileUploadSize: number;
  allowedFileTypes: string[];
  sessionTimeout: number;
}

export interface BroadcastMessage {
  id: string;
  title: string;
  message: string;
  targetAudience: "all" | "parents" | "medical_staff" | "administrators";
  priority: "low" | "medium" | "high" | "urgent";
  status: "draft" | "sent" | "scheduled";
  scheduledAt?: Timestamp;
  sentAt?: Timestamp;
  sentBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SystemBackup {
  id: string;
  type: "full" | "users" | "medical_events" | "medicines";
  fileName: string;
  fileSize: number;
  status: "processing" | "completed" | "failed";
  createdAt: Timestamp;
  createdBy: string;
  downloadUrl?: string;
}

// Get school information
export const getSchoolInfo = async (): Promise<SchoolInfo | null> => {
  try {
    const schoolDoc = await getDoc(doc(db, "system_config", "school_info"));
    if (schoolDoc.exists()) {
      return schoolDoc.data() as SchoolInfo;
    }
    return null;
  } catch (error) {
    console.error("Error getting school info:", error);
    throw error;
  }
};

// Update school information
export const updateSchoolInfo = async (
  schoolInfo: SchoolInfo
): Promise<void> => {
  try {
    await setDoc(doc(db, "system_config", "school_info"), {
      ...schoolInfo,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating school info:", error);
    throw error;
  }
};

// Get notification settings
export const getNotificationSettings =
  async (): Promise<NotificationSettings | null> => {
    try {
      const settingsDoc = await getDoc(
        doc(db, "system_config", "notification_settings")
      );
      if (settingsDoc.exists()) {
        return settingsDoc.data() as NotificationSettings;
      }
      return null;
    } catch (error) {
      console.error("Error getting notification settings:", error);
      throw error;
    }
  };

// Update notification settings
export const updateNotificationSettings = async (
  settings: NotificationSettings
): Promise<void> => {
  try {
    await setDoc(doc(db, "system_config", "notification_settings"), {
      ...settings,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    throw error;
  }
};

// Get system settings
export const getSystemSettings = async (): Promise<SystemSettings | null> => {
  try {
    const settingsDoc = await getDoc(
      doc(db, "system_config", "system_settings")
    );
    if (settingsDoc.exists()) {
      return settingsDoc.data() as SystemSettings;
    }
    return null;
  } catch (error) {
    console.error("Error getting system settings:", error);
    throw error;
  }
};

// Update system settings
export const updateSystemSettings = async (
  settings: SystemSettings
): Promise<void> => {
  try {
    await setDoc(doc(db, "system_config", "system_settings"), {
      ...settings,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating system settings:", error);
    throw error;
  }
};

// Send broadcast message
export const sendBroadcastMessage = async (
  message: Omit<BroadcastMessage, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, "broadcast_messages"), {
      ...message,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error sending broadcast message:", error);
    throw error;
  }
};

// Get broadcast messages
export const getBroadcastMessages = async (): Promise<BroadcastMessage[]> => {
  try {
    const messagesRef = collection(db, "broadcast_messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as BroadcastMessage[];
  } catch (error) {
    console.error("Error getting broadcast messages:", error);
    throw error;
  }
};

// Create system backup
export const createSystemBackup = async (
  backup: Omit<SystemBackup, "id" | "createdAt">
): Promise<string> => {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, "system_backups"), {
      ...backup,
      createdAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating system backup:", error);
    throw error;
  }
};

// Get system backups
export const getSystemBackups = async (): Promise<SystemBackup[]> => {
  try {
    const backupsRef = collection(db, "system_backups");
    const q = query(backupsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as SystemBackup[];
  } catch (error) {
    console.error("Error getting system backups:", error);
    throw error;
  }
};

// Initialize default system configuration
export const initializeSystemConfig = async (): Promise<void> => {
  try {
    // Initialize school info
    const schoolInfo: SchoolInfo = {
      name: "Trường THPT Medical MMA",
      address: "TP. Hồ Chí Minh",
      phone: "028-1234-5678",
      email: "info@school.edu.vn",
      website: "https://school.edu.vn",
      description: "Hệ thống quản lý y tế học đường",
    };

    // Initialize notification settings
    const notificationSettings: NotificationSettings = {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      reminderNotifications: true,
      emergencyNotifications: true,
    };

    // Initialize system settings
    const systemSettings: SystemSettings = {
      allowSelfRegistration: true,
      requireEmailVerification: true,
      autoApproveParents: false,
      maintenanceMode: false,
      maxFileUploadSize: 10 * 1024 * 1024, // 10MB
      allowedFileTypes: ["jpg", "jpeg", "png", "pdf", "doc", "docx"],
      sessionTimeout: 30 * 60, // 30 minutes
    };

    await Promise.all([
      updateSchoolInfo(schoolInfo),
      updateNotificationSettings(notificationSettings),
      updateSystemSettings(systemSettings),
    ]);

    console.log("✅ System configuration initialized successfully");
  } catch (error) {
    console.error("Error initializing system configuration:", error);
    throw error;
  }
};
