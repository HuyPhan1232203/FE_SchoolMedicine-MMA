// Create Admin Firestore Profiles
// Sau khi đã tạo admin accounts trong Firebase Console
// Run: node scripts/createAdminProfiles.js

import { initializeApp } from 'firebase/app';
import { doc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';

// Import your Firebase config
const firebaseConfig = {
  // TODO: Copy từ constants/firebaseConfig.ts
  // BƯỚC: Mở constants/firebaseConfig.ts và copy config vào đây
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Admin profiles to create (với UIDs từ Firebase Console)
// TODO: Thay thế UIDs bằng UIDs thực tế từ Firebase Console
const adminProfiles = [
  {
    uid: "REPLACE_WITH_REAL_UID_1", // Copy từ Firebase Console → Authentication → User → User UID
    email: "admin@school.edu.vn",
    fullName: "Administrator",
    phoneNumber: "0999888777",
    permissions: ["*"] // All permissions
  },
  {
    uid: "REPLACE_WITH_REAL_UID_2", // Copy từ Firebase Console
    email: "director@school.edu.vn",
    fullName: "Hiệu trưởng", 
    phoneNumber: "0888777666",
    permissions: ["manage_users", "view_reports", "system_admin"]
  },
  {
    uid: "REPLACE_WITH_REAL_UID_3", // Copy từ Firebase Console
    email: "manager@school.edu.vn",
    fullName: "Quản lý hệ thống",
    phoneNumber: "0777666555", 
    permissions: ["manage_users", "view_reports"]
  }
];

async function createAdminProfiles() {
  console.log('🏥 Creating Admin Firestore Profiles...\n');

  for (const admin of adminProfiles) {
    try {
      console.log(`👤 Creating profile: ${admin.email}`);

      const userProfile = {
        uid: admin.uid,
        email: admin.email,
        fullName: admin.fullName,
        phoneNumber: admin.phoneNumber,
        role: 'administrator',
        status: 'approved',
        permissions: admin.permissions,
        approvedBy: 'SYSTEM_SETUP',
        approvedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        emailVerified: true,
        mustChangePassword: true,
      };

      await setDoc(doc(db, 'users', admin.uid), userProfile);
      console.log(`✅ Profile created for ${admin.email}`);

    } catch (error) {
      console.error(`❌ Error creating profile for ${admin.email}:`, error);
    }
  }

  console.log('\n🎉 All admin profiles created!');
}

createAdminProfiles(); 