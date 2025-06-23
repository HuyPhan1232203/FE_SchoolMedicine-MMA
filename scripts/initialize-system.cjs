// Initialize Complete School Medical System - CommonJS Version
// Run: node scripts/initialize-system.cjs

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
const { getFirestore, Timestamp, writeBatch, doc, setDoc } = require('firebase/firestore');

// Firebase Configuration (copy từ constants/firebaseConfig.ts)
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyBf-SjBgQpScgPOvdTXa9Viu3refqrfh34",
    authDomain: "mma-297bc.firebaseapp.com",
    databaseURL: "https://mma-297bc-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "mma-297bc",
    storageBucket: "mma-297bc.firebasestorage.app",
    messagingSenderId: "275882095501",
    appId: "1:275882095501:web:42aa23de207031090143c4",
    measurementId: "G-MZ7P1598DH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// System Configuration
const SYSTEM_CONFIG = {
  totalStudents: 300,
  studentsPerGrade: 25,
  grades: ['10A1', '10A2', '10B1', '10B2', '11A1', '11A2', '11B1', '11B2', '12A1', '12A2', '12B1', '12B2'],
  
  adminAccounts: [
    {
      email: 'admin@school.edu.vn',
      password: 'SchoolAdmin2025!',
      fullName: 'Administrator',
      phoneNumber: '0999888777',
      permissions: ['*']
    },
    {
      email: 'director@school.edu.vn', 
      password: 'Director2025!',
      fullName: 'Hiệu trưởng',
      phoneNumber: '0888777666',
      permissions: ['manage_users', 'view_reports', 'system_admin']
    },
    {
      email: 'nurse@school.edu.vn',
      password: 'Nurse2025!',
      fullName: 'Y tá trưởng',
      phoneNumber: '0777666555',
      permissions: ['manage_health', 'view_reports']
    }
  ]
};

// Vietnamese Names Database
const vietnameseNames = {
  lastNames: ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Huỳnh', 'Hoàng', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương'],
  middleNames: ['Văn', 'Thị', 'Minh', 'Hoàng', 'Thanh', 'Thu', 'Kim', 'Hữu', 'Đức', 'Quang', 'Anh', 'Hồng'],
  firstNames: {
    male: ['An', 'Bình', 'Cường', 'Dũng', 'Hùng', 'Khang', 'Long', 'Minh', 'Nam', 'Phúc', 'Quân', 'Sơn', 'Thành', 'Toàn', 'Tuấn', 'Vinh'],
    female: ['Anh', 'Bích', 'Chi', 'Dung', 'Hạnh', 'Hương', 'Lan', 'Linh', 'Mai', 'Nga', 'Phương', 'Quyên', 'Thảo', 'Trang', 'Uyên', 'Yến']
  }
};

// Medical Templates
const medicalData = {
  bloodTypes: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  allergies: ['Hải sản', 'Đậu phộng', 'Sữa', 'Trứng', 'Phấn hoa', 'Bụi nhà', 'Thuốc kháng sinh'],
  diseases: ['Hen suyễn', 'Cận thị', 'Viêm xoang', 'Viêm amidan', 'Thiếu máu'],
  medications: ['Vitamin D3', 'Vitamin C', 'Ventolin', 'Thuốc nhỏ mắt']
};

// Utility Functions
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateVietnameseName(gender) {
  const lastName = randomChoice(vietnameseNames.lastNames);
  const middleName = randomChoice(vietnameseNames.middleNames);
  const firstName = randomChoice(vietnameseNames.firstNames[gender]);
  return `${lastName} ${middleName} ${firstName}`;
}

// 1. Create Admin Accounts
async function createAdminAccounts() {
  console.log('👑 Creating Admin Accounts...\n');
  
  for (const adminData of SYSTEM_CONFIG.adminAccounts) {
    try {
      console.log(`📧 Creating: ${adminData.email}`);

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        adminData.email, 
        adminData.password
      );
      
      const user = userCredential.user;
      console.log(`   ✅ Auth created: ${user.uid}`);

      // Update display name
      await updateProfile(user, {
        displayName: adminData.fullName
      });

      // Create Firestore profile  
      const userProfile = {
        uid: user.uid,
        email: adminData.email,
        fullName: adminData.fullName,
        phoneNumber: adminData.phoneNumber,
        role: 'administrator',
        status: 'approved',
        permissions: adminData.permissions,
        approvedBy: 'SYSTEM_INIT',
        approvedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        emailVerified: false, // Will be set manually
        mustChangePassword: true,
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
      console.log(`   ✅ Profile created`);
      console.log(`   🔑 Credentials: ${adminData.email} / ${adminData.password}\n`);

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`   ⚠️  Email already exists: ${adminData.email}`);
      } else {
        console.error(`   ❌ Error: ${error.message}`);
      }
    }
  }
}

// 2. Create Students
async function createStudents() {
  console.log('🏥 Creating Students with Medical Records...\n');
  
  let studentNumber = 1;
  const batchSize = 450;
  
  for (let i = 0; i < SYSTEM_CONFIG.totalStudents; i += batchSize) {
    const batch = writeBatch(db);
    const batchEnd = Math.min(i + batchSize, SYSTEM_CONFIG.totalStudents);
    
    console.log(`📦 Batch ${Math.floor(i / batchSize) + 1}: Students ${i + 1}-${batchEnd}`);
    
    for (let j = i; j < batchEnd; j++) {
      const gradeIndex = Math.floor(j / SYSTEM_CONFIG.studentsPerGrade);
      const grade = SYSTEM_CONFIG.grades[gradeIndex];
      const gender = Math.random() < 0.5 ? 'male' : 'female';
      const age = randomInt(15, 18);
      
      const student = {
        studentId: `HS${studentNumber.toString().padStart(3, '0')}`,
        fullName: generateVietnameseName(gender),
        dateOfBirth: Timestamp.fromDate(new Date(2024 - age, randomInt(0, 11), randomInt(1, 28))),
        gender,
        grade,
        academicYear: '2024-2025',
        
        address: `${randomInt(1, 999)} ${randomChoice(['Đường Lê Lợi', 'Đường Nguyễn Huệ'])}, ${randomChoice(['Quận 1', 'Quận 3'])}, TP.HCM`,
        phoneNumber: Math.random() < 0.3 ? `09${randomInt(10000000, 99999999)}` : null,
        
        parentContact: {
          fatherName: generateVietnameseName('male'),
          fatherPhone: `09${randomInt(10000000, 99999999)}`,
          motherName: generateVietnameseName('female'),
          motherPhone: `09${randomInt(10000000, 99999999)}`,
          emergencyContact: `09${randomInt(10000000, 99999999)}`
        },
        
        // Medical Information
        medicalInfo: {
          bloodType: randomChoice(medicalData.bloodTypes),
          allergies: Math.random() < 0.3 ? [randomChoice(medicalData.allergies)] : [],
          chronicDiseases: Math.random() < 0.15 ? [randomChoice(medicalData.diseases)] : [],
          medications: Math.random() < 0.2 ? [randomChoice(medicalData.medications)] : [],
          medicalHistory: [],
          disabilities: [],
          specialNeeds: [],
          notes: ''
        },
        
        // Health Metrics
        healthMetrics: {
          height: gender === 'male' ? randomInt(160, 180) : randomInt(150, 170),
          weight: gender === 'male' ? randomInt(45, 75) : randomInt(40, 65),
          bmi: 0, // Will calculate
          bmiCategory: 'normal',
          bloodPressure: {
            systolic: randomInt(100, 130),
            diastolic: randomInt(60, 85)
          },
          heartRate: randomInt(60, 100),
          temperature: 36.5,
          lastMeasuredAt: Timestamp.now()
        },
        
        // Current Health Status
        currentHealthStatus: {
          status: randomChoice(['healthy', 'healthy', 'healthy', 'chronic', 'at_risk']), // 60% healthy
          lastCheckupDate: Timestamp.fromDate(new Date(Date.now() - randomInt(30, 180) * 24 * 60 * 60 * 1000)),
          nextCheckupDue: Timestamp.fromDate(new Date(Date.now() + randomInt(90, 365) * 24 * 60 * 60 * 1000)),
          restrictions: [],
          clearanceForSports: true,
          clearanceForTrips: true
        },
        
        // System fields
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'SYSTEM_INIT',
        lastUpdatedBy: 'SYSTEM_INIT',
        isActive: true
      };
      
      // Calculate BMI
      const heightInMeters = student.healthMetrics.height / 100;
      student.healthMetrics.bmi = parseFloat((student.healthMetrics.weight / (heightInMeters * heightInMeters)).toFixed(1));
      
      const studentRef = doc(db, 'students', student.studentId);
      batch.set(studentRef, student);
      
      studentNumber++;
    }
    
    try {
      await batch.commit();
      console.log(`   ✅ Saved ${batchEnd - i} students to Firebase`);
    } catch (error) {
      console.error(`   ❌ Error saving batch: ${error.message}`);
      throw error;
    }
  }
}

// 3. Initialize System Data
async function initializeSystemData() {
  console.log('⚙️ Initializing System Data...\n');
  
  // School Info
  const schoolInfo = {
    schoolName: 'Trường THPT Medical MMA',
    address: 'TP. Hồ Chí Minh',
    academicYear: '2024-2025',
    totalStudents: SYSTEM_CONFIG.totalStudents,
    totalGrades: SYSTEM_CONFIG.grades.length,
    systemInitializedAt: Timestamp.now(),
    version: '1.0.0'
  };
  
  await setDoc(doc(db, 'system', 'school_info'), schoolInfo);
  console.log('✅ School information saved');
  
  // Medical Categories
  const medicalCategories = {
    bloodTypes: medicalData.bloodTypes,
    commonAllergies: medicalData.allergies,
    commonDiseases: medicalData.diseases,
    commonMedications: medicalData.medications,
    updatedAt: Timestamp.now()
  };
  
  await setDoc(doc(db, 'system', 'medical_categories'), medicalCategories);
  console.log('✅ Medical categories saved');
}

// Main Initialization Function
async function initializeSystem() {
  console.log(`
🏥 INITIALIZING SCHOOL MEDICAL MANAGEMENT SYSTEM
📡 Firebase Project: mma-297bc
🎯 Complete system setup with realistic data

Starting initialization...
  `);
  
  try {
    // Step 1: Create Admin Accounts
    await createAdminAccounts();
    
    // Step 2: Create Students
    await createStudents();
    
    // Step 3: Initialize System Data
    await initializeSystemData();
    
    console.log(`
🎉 SYSTEM INITIALIZATION COMPLETED!

📊 Summary:
   ✅ ${SYSTEM_CONFIG.adminAccounts.length} Admin accounts created
   ✅ ${SYSTEM_CONFIG.totalStudents} Students with medical records
   ✅ ${SYSTEM_CONFIG.grades.length} Grades configured
   ✅ System data initialized

🔑 Admin Login Credentials:
`);
    
    SYSTEM_CONFIG.adminAccounts.forEach(admin => {
      console.log(`   📧 ${admin.email} / 🔒 ${admin.password}`);
    });
    
    console.log(`
📋 Next Steps:
1. 🔥 Firebase Console → Authentication → Set "Email verified" for admins
2. 🔥 Firebase Console → Firestore → Verify data
3. 📱 Test admin login trong app
4. 🏥 Test student data display
5. 🚀 Deploy to production

⚠️  IMPORTANT: Change admin passwords after first login!
    `);
    
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    throw error;
  }
}

// Preview
console.log(`
🏥 SCHOOL MEDICAL SYSTEM INITIALIZER

📡 Firebase Project: mma-297bc
🎯 Will create complete medical school system

Starting in 3 seconds...
`);

// Delay để người dùng đọc preview
setTimeout(() => {
  initializeSystem().catch(console.error);
}, 3000); 