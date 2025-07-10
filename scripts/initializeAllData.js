const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  addDoc,
  Timestamp,
} = require("firebase/firestore");

// Firebase config - replace with your actual config
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize System Configuration
async function initializeSystemConfig() {
  try {
    console.log("🔄 Initializing system configuration...");

    // School info
    await addDoc(collection(db, "system_config"), {
      name: "school_info",
      data: {
        name: "Trường THPT Medical MMA",
        address: "TP. Hồ Chí Minh",
        phone: "028-1234-5678",
        email: "info@school.edu.vn",
        website: "https://school.edu.vn",
        description: "Hệ thống quản lý y tế học đường",
        updatedAt: Timestamp.now(),
      },
    });

    // Notification settings
    await addDoc(collection(db, "system_config"), {
      name: "notification_settings",
      data: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        reminderNotifications: true,
        emergencyNotifications: true,
        updatedAt: Timestamp.now(),
      },
    });

    // System settings
    await addDoc(collection(db, "system_config"), {
      name: "system_settings",
      data: {
        allowSelfRegistration: true,
        requireEmailVerification: true,
        autoApproveParents: false,
        maintenanceMode: false,
        maxFileUploadSize: 10 * 1024 * 1024,
        allowedFileTypes: ["jpg", "jpeg", "png", "pdf", "doc", "docx"],
        sessionTimeout: 30 * 60,
        updatedAt: Timestamp.now(),
      },
    });

    console.log("✅ System configuration initialized");
  } catch (error) {
    console.error("❌ Error initializing system config:", error);
  }
}

// Initialize Approval Requests
async function initializeApprovalRequests() {
  try {
    console.log("🔄 Initializing approval requests...");

    const sampleRequests = [
      {
        userId: "user1",
        userEmail: "nguyenvanan@gmail.com",
        fullName: "Nguyễn Văn An",
        phoneNumber: "0901234567",
        requestedRole: "parent",
        requestType: "registration",
        reason: "Đăng ký tài khoản để theo dõi sức khỏe con",
        submittedAt: Timestamp.now(),
        status: "pending",
        documents: ["CMND_front.jpg", "CMND_back.jpg"],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        userId: "user2",
        userEmail: "tranthilan@yahoo.com",
        fullName: "Trần Thị Lan",
        phoneNumber: "0912345678",
        requestedRole: "medical_staff",
        requestType: "role_change",
        reason: "Chuyển từ phụ huynh sang cán bộ y tế",
        submittedAt: Timestamp.now(),
        status: "pending",
        documents: ["CV.pdf", "Certificate.jpg"],
        notes: "Có kinh nghiệm 5 năm trong lĩnh vực y tế",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        userId: "user3",
        userEmail: "levancuong@hotmail.com",
        fullName: "Lê Văn Cường",
        phoneNumber: "0923456789",
        requestedRole: "parent",
        requestType: "registration",
        reason: "Đăng ký tài khoản phụ huynh",
        submittedAt: Timestamp.now(),
        status: "approved",
        documents: ["CMND_front.jpg"],
        approvedBy: "admin1",
        approvedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ];

    for (const request of sampleRequests) {
      await addDoc(collection(db, "approval_requests"), request);
    }

    console.log("✅ Approval requests initialized");
  } catch (error) {
    console.error("❌ Error initializing approval requests:", error);
  }
}

// Initialize Import History
async function initializeImportHistory() {
  try {
    console.log("🔄 Initializing import history...");

    const sampleHistory = [
      {
        fileName: "danh_sach_hoc_sinh_2024.xlsx",
        type: "Danh sách học sinh",
        records: 350,
        success: 348,
        failed: 2,
        date: Timestamp.now(),
        status: "completed",
        createdBy: "Admin",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        fileName: "phu_huynh_quy_1.csv",
        type: "Danh sách phụ huynh",
        records: 280,
        success: 275,
        failed: 5,
        date: Timestamp.now(),
        status: "completed",
        createdBy: "Admin",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
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
        createdBy: "Admin",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ];

    for (const history of sampleHistory) {
      await addDoc(collection(db, "import_history"), history);
    }

    console.log("✅ Import history initialized");
  } catch (error) {
    console.error("❌ Error initializing import history:", error);
  }
}

// Initialize Medical Events
async function initializeMedicalEvents() {
  try {
    console.log("🔄 Initializing medical events...");

    const sampleEvents = [
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
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
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
        actions: ["Sơ cứu tại chỗ", "Đưa đến bệnh viện", "Thông báo phụ huynh"],
        notes: "Học sinh đã được điều trị và xuất viện",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
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
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ];

    for (const event of sampleEvents) {
      await addDoc(collection(db, "medical_events"), event);
    }

    console.log("✅ Medical events initialized");
  } catch (error) {
    console.error("❌ Error initializing medical events:", error);
  }
}

// Initialize Broadcast Messages
async function initializeBroadcastMessages() {
  try {
    console.log("🔄 Initializing broadcast messages...");

    const sampleMessages = [
      {
        title: "Thông báo về dịch cúm",
        message:
          "Nhà trường thông báo về tình hình dịch cúm mùa và các biện pháp phòng ngừa",
        targetAudience: "all",
        priority: "high",
        status: "sent",
        sentBy: "Admin",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        title: "Lịch tiêm chủng tháng 12",
        message: "Thông báo lịch tiêm chủng vaccine cho học sinh các khối lớp",
        targetAudience: "parents",
        priority: "medium",
        status: "sent",
        sentBy: "Admin",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ];

    for (const message of sampleMessages) {
      await addDoc(collection(db, "broadcast_messages"), message);
    }

    console.log("✅ Broadcast messages initialized");
  } catch (error) {
    console.error("❌ Error initializing broadcast messages:", error);
  }
}

// Initialize Users (Parents and Medical Staff)
async function initializeUsers() {
  try {
    console.log("🔄 Initializing users...");

    const sampleUsers = [
      // Parents
      {
        uid: "parent1",
        email: "nguyenvanan@gmail.com",
        fullName: "Nguyễn Văn An",
        phoneNumber: "0901234567",
        role: "parent",
        status: "active",
        studentId: "HS001",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        emailVerified: true,
      },
      {
        uid: "parent2",
        email: "tranthilan@yahoo.com",
        fullName: "Trần Thị Lan",
        phoneNumber: "0912345678",
        role: "parent",
        status: "active",
        studentId: "HS002",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        emailVerified: true,
      },
      {
        uid: "parent3",
        email: "levancuong@hotmail.com",
        fullName: "Lê Văn Cường",
        phoneNumber: "0923456789",
        role: "parent",
        status: "active",
        studentId: "HS003",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        emailVerified: true,
      },
      // Medical Staff
      {
        uid: "medstaff1",
        email: "bacsilan@school.edu.vn",
        fullName: "Bác sĩ Nguyễn Thị Lan",
        phoneNumber: "0934567890",
        role: "medical_staff",
        status: "active",
        department: "Phòng Y tế",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        emailVerified: true,
      },
      {
        uid: "medstaff2",
        email: "bacsihung@school.edu.vn",
        fullName: "Bác sĩ Trần Văn Hùng",
        phoneNumber: "0945678901",
        role: "medical_staff",
        status: "active",
        department: "Phòng Y tế",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        emailVerified: true,
      },
      {
        uid: "medstaff3",
        email: "bacsimai@school.edu.vn",
        fullName: "Bác sĩ Lê Thị Mai",
        phoneNumber: "0956789012",
        role: "medical_staff",
        status: "active",
        department: "Phòng Y tế",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        emailVerified: true,
      },
    ];

    for (const user of sampleUsers) {
      await addDoc(collection(db, "users"), user);
    }

    console.log("✅ Users initialized");
  } catch (error) {
    console.error("❌ Error initializing users:", error);
  }
}

// Initialize Medicines
async function initializeMedicines() {
  try {
    console.log("🔄 Initializing medicines...");

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
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
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
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
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
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
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
        description: "Kháng sinh điều trị nhiễm khuẩn",
        sideEffects: "Có thể gây rối loạn tiêu hóa",
        contraindications: "Không dùng cho người dị ứng penicillin",
        storage: "Nơi khô ráo, nhiệt độ thường",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ];

    for (const medicine of sampleMedicines) {
      await addDoc(collection(db, "medicines"), medicine);
    }

    console.log("✅ Medicines initialized");
  } catch (error) {
    console.error("❌ Error initializing medicines:", error);
  }
}

// Main initialization function
async function initializeAllData() {
  console.log("🚀 Starting comprehensive data initialization...");

  try {
    await Promise.all([
      initializeSystemConfig(),
      initializeApprovalRequests(),
      initializeImportHistory(),
      initializeMedicalEvents(),
      initializeBroadcastMessages(),
      initializeUsers(),
      initializeMedicines(),
    ]);

    console.log("🎉 All data initialized successfully!");
    console.log("📊 Summary:");
    console.log("   - System configuration: ✅");
    console.log("   - Approval requests: ✅");
    console.log("   - Import history: ✅");
    console.log("   - Medical events: ✅");
    console.log("   - Broadcast messages: ✅");
    console.log("   - Users: ✅");
    console.log("   - Medicines: ✅");
  } catch (error) {
    console.error("❌ Error during initialization:", error);
  } finally {
    process.exit(0);
  }
}

// Run the initialization
initializeAllData();
