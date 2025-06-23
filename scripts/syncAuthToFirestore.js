// Sync Firebase Auth Users to Firestore Profiles
// Dành cho admin đã tạo trong Firebase Auth console
// Run: node scripts/syncAuthToFirestore.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';

// TODO: Copy Firebase config từ constants/firebaseConfig.ts
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Mapping Email → Admin Data
// TODO: Cập nhật emails theo admin thực tế trong Firebase Auth
const adminMapping = {
  'admin@school.edu.vn': {
    fullName: 'Administrator', 
    phoneNumber: '0999888777',
    permissions: ['*'], // All permissions
    level: 'super_admin'
  },
  'director@school.edu.vn': {
    fullName: 'Hiệu trưởng',
    phoneNumber: '0888777666', 
    permissions: ['manage_users', 'view_reports', 'system_admin'],
    level: 'director'
  },
  'manager@school.edu.vn': {
    fullName: 'Quản lý hệ thống',
    phoneNumber: '0777666555',
    permissions: ['manage_users', 'view_reports'], 
    level: 'manager'
  }
};

async function syncAuthToFirestore() {
  console.log('🔄 Syncing Firebase Auth → Firestore...\n');

  // Note: Firebase Client SDK không thể list all users
  // Cần dùng Firebase Admin SDK hoặc manual input UIDs
  
  console.log('📋 Manual Input Required:');
  console.log('1. Vào Firebase Console → Authentication → Users');
  console.log('2. Copy UIDs của admin users');
  console.log('3. Paste vào adminUIDs array dưới đây\n');

  // TODO: Input UIDs từ Firebase Console
  const adminUIDs = [
    {
      uid: 'PASTE_UID_HERE_1', // admin@school.edu.vn
      email: 'admin@school.edu.vn'
    },
    {
      uid: 'PASTE_UID_HERE_2', // director@school.edu.vn  
      email: 'director@school.edu.vn'
    },
    {
      uid: 'PASTE_UID_HERE_3', // manager@school.edu.vn
      email: 'manager@school.edu.vn'
    }
  ];

  for (const adminUser of adminUIDs) {
    try {
      console.log(`👤 Processing: ${adminUser.email}`);

      // Check if Firestore profile already exists
      const userRef = doc(db, 'users', adminUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        console.log(`   ⚠️  Profile already exists. Skipping...`);
        continue;
      }

      // Get admin data from mapping
      const adminData = adminMapping[adminUser.email];
      if (!adminData) {
        console.log(`   ❌ No mapping found for ${adminUser.email}`);
        continue;
      }

      // Create Firestore profile
      const userProfile = {
        uid: adminUser.uid,
        email: adminUser.email,
        fullName: adminData.fullName,
        phoneNumber: adminData.phoneNumber,
        role: 'administrator',
        status: 'approved', // Auto-approve admins
        permissions: adminData.permissions,
        level: adminData.level,
        approvedBy: 'SYSTEM_SYNC',
        approvedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        emailVerified: true, // Assume verified
        mustChangePassword: true,
        syncedFromAuth: true,
        syncedAt: serverTimestamp()
      };

      await setDoc(userRef, userProfile);
      console.log(`   ✅ Firestore profile created`);

    } catch (error) {
      console.error(`   ❌ Error processing ${adminUser.email}:`, error.message);
    }
  }

  console.log('\n🎉 Sync completed!');
  console.log('\n📋 VERIFY:');
  console.log('1. Firebase Console → Firestore → users collection');
  console.log('2. Check admin documents có đầy đủ thông tin');
  console.log('3. Test đăng nhập admin trong app');
}

// Helper function: Auto-detect và tạo UID mapping
function generateUIDMappingTemplate() {
  console.log(`
📋 UID MAPPING TEMPLATE:

Copy UIDs từ Firebase Console và replace:

const adminUIDs = [
  {
    uid: 'abc123def456...', // Copy từ Firebase Console
    email: 'admin@school.edu.vn'
  },
  {
    uid: 'xyz789uvw012...', // Copy từ Firebase Console
    email: 'director@school.edu.vn'  
  },
  {
    uid: 'pqr345stu678...', // Copy từ Firebase Console
    email: 'manager@school.edu.vn'
  }
];

🔍 Cách lấy UID:
1. Firebase Console → Authentication → Users
2. Click vào admin user 
3. Copy "User UID" field
  `);
}

// Show template trước khi chạy
generateUIDMappingTemplate();

// Uncomment để chạy sync
// syncAuthToFirestore(); 