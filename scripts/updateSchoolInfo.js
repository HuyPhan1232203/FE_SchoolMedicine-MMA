// Update School Information with Default Data
// Run: node scripts/updateSchoolInfo.js

const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc, Timestamp } = require("firebase/firestore");

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBf-SjBgQpScgPOvdTXa9Viu3refqrfh34",
  authDomain: "mma-297bc.firebaseapp.com",
  databaseURL:
    "https://mma-297bc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mma-297bc",
  storageBucket: "mma-297bc.appspot.com",
  messagingSenderId: "275882095501",
  appId: "1:275882095501:web:42aa23de207031090143c4",
  measurementId: "G-MZ7P1598DH",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateSchoolInfo() {
  try {
    console.log("🏫 Updating School Information...\n");

    // Default school information
    const schoolInfo = {
      name: "Trường THPT Medical MMA",
      address: "123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh",
      phone: "028-1234-5678",
      email: "info@school.edu.vn",
      website: "https://school.edu.vn",
      description: "Hệ thống quản lý y tế học đường - Trường THPT Medical MMA",
      updatedAt: Timestamp.now(),
    };

    // Update school info
    await setDoc(doc(db, "system_config", "school_info"), schoolInfo);
    console.log("✅ School Information Updated:");
    console.log("📚 Name:", schoolInfo.name);
    console.log("📍 Address:", schoolInfo.address);
    console.log("📞 Phone:", schoolInfo.phone);
    console.log("📧 Email:", schoolInfo.email);
    console.log("🌐 Website:", schoolInfo.website);
    console.log("📝 Description:", schoolInfo.description);

    // Update notification settings
    const notificationSettings = {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      reminderNotifications: true,
      emergencyNotifications: true,
      updatedAt: Timestamp.now(),
    };

    await setDoc(
      doc(db, "system_config", "notification_settings"),
      notificationSettings
    );
    console.log("\n✅ Notification Settings Updated");

    // Update system settings
    const systemSettings = {
      allowSelfRegistration: true,
      requireEmailVerification: true,
      autoApproveParents: false,
      maintenanceMode: false,
      maxFileUploadSize: 10 * 1024 * 1024, // 10MB
      allowedFileTypes: ["jpg", "jpeg", "png", "pdf", "doc", "docx"],
      sessionTimeout: 30 * 60, // 30 minutes
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(db, "system_config", "system_settings"), systemSettings);
    console.log("✅ System Settings Updated");

    console.log("\n🎉 All system configuration updated successfully!");
  } catch (error) {
    console.error("❌ Error updating school info:", error);
  }
}

updateSchoolInfo();
