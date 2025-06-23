// Setup Admin Accounts Script
// Run: node scripts/setupAdmin.js

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

// Initialize Firebase Admin SDK
const app = initializeApp({
  credential: applicationDefault(),
  projectId: 'school-medicine-mma' // Thay bằng project ID thực tế
});

const auth = getAuth(app);
const firestore = getFirestore(app);

// Admin accounts to create
const adminAccounts = [
  {
    email: 'admin1@school.edu.vn',
    password: 'SchoolMed2025!', // Strong default password
    fullName: 'Nguyễn Thị Quản Lý',
    phoneNumber: '0999888777',
    permissions: ['manage_users', 'view_reports', 'system_admin']
  },
  {
    email: 'admin2@school.edu.vn', 
    password: 'SchoolAdmin2025!',
    fullName: 'Trần Văn Điều Hành',
    phoneNumber: '0666555444',
    permissions: ['manage_users', 'view_reports']
  },
  {
    email: 'superadmin@school.edu.vn',
    password: 'SuperAdmin2025!',
    fullName: 'Super Administrator',
    phoneNumber: '0888999000',
    permissions: ['*'] // All permissions
  }
];

async function setupAdminAccounts() {
  console.log('🚀 Starting Admin Account Setup...\n');

  for (const adminData of adminAccounts) {
    try {
      console.log(`📧 Setting up: ${adminData.email}`);

      // Step 1: Create Firebase Auth user
      const userRecord = await auth.createUser({
        email: adminData.email,
        password: adminData.password,
        emailVerified: true, // Auto-verify admin emails
        displayName: adminData.fullName,
      });

      console.log(`✅ Firebase Auth created: ${userRecord.uid}`);

      // Step 2: Create Firestore profile
      const userProfile = {
        uid: userRecord.uid,
        email: adminData.email,
        fullName: adminData.fullName,
        phoneNumber: adminData.phoneNumber,
        role: 'administrator',
        status: 'approved', // Auto-approve admins
        permissions: adminData.permissions,
        approvedBy: 'SYSTEM_SETUP',
        approvedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        emailVerified: true,
        mustChangePassword: true, // Force password change on first login
      };

      await firestore.collection('users').doc(userRecord.uid).set(userProfile);
      console.log(`✅ Firestore profile created`);

      // Step 3: Set custom claims for role-based access
      await auth.setCustomUserClaims(userRecord.uid, {
        role: 'administrator',
        permissions: adminData.permissions
      });

      console.log(`✅ Custom claims set`);
      console.log(`📝 Login credentials: ${adminData.email} / ${adminData.password}\n`);

    } catch (error) {
      console.error(`❌ Error setting up ${adminData.email}:`, error.message);
    }
  }

  console.log('🎉 Admin setup completed!');
  console.log('\n📋 ADMIN LOGIN CREDENTIALS:');
  adminAccounts.forEach(admin => {
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${admin.password}`);
    console.log(`   Role: Administrator\n`);
  });

  console.log('⚠️  IMPORTANT: Change passwords after first login!');
}

// Run the setup
setupAdminAccounts()
  .then(() => {
    console.log('✅ Setup script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup script failed:', error);
    process.exit(1);
  }); 