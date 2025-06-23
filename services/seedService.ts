import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

// Default admin accounts
const DEFAULT_ADMINS = [
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
  }
];

// Check if admin exists
const adminExists = async (email: string): Promise<boolean> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email), where('role', '==', 'administrator'));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking admin existence:', error);
    return false;
  }
};

// Create admin account
const createAdminAccount = async (adminData: typeof DEFAULT_ADMINS[0]) => {
  try {
    console.log(`🔧 Creating admin: ${adminData.email}`);

    // Step 1: Create Firebase Auth user
    const { user } = await createUserWithEmailAndPassword(
      auth, 
      adminData.email, 
      adminData.password
    );

    // Step 2: Create Firestore profile
    const userProfile = {
      uid: user.uid,
      email: adminData.email,
      fullName: adminData.fullName,
      phoneNumber: adminData.phoneNumber,
      role: 'administrator',
      status: 'approved',
      permissions: adminData.permissions,
      approvedBy: 'SYSTEM_SEED',
      approvedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      emailVerified: true,
      mustChangePassword: true,
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);

    console.log(`✅ Admin created: ${adminData.email}`);
    return true;

  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`⚠️  Admin already exists: ${adminData.email}`);
    } else {
      console.error(`❌ Error creating admin ${adminData.email}:`, error.message);
    }
    return false;
  }
};

// Main seed function
export const seedAdminAccounts = async (): Promise<void> => {
  console.log('🌱 Seeding admin accounts...');

  try {
    for (const admin of DEFAULT_ADMINS) {
      const exists = await adminExists(admin.email);
      
      if (!exists) {
        await createAdminAccount(admin);
      } else {
        console.log(`✅ Admin already exists: ${admin.email}`);
      }
    }

    console.log('🎉 Admin seeding completed!');
    console.log('\n📋 DEFAULT ADMIN CREDENTIALS:');
    DEFAULT_ADMINS.forEach(admin => {
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: ${admin.password}`);
      console.log('   ⚠️  Change password after first login!\n');
    });

  } catch (error) {
    console.error('❌ Error seeding admin accounts:', error);
  }
};

// Development helper - only run in development
export const devSeedAdmins = async (): Promise<void> => {
  if (__DEV__ || process.env.NODE_ENV === 'development') {
    await seedAdminAccounts();
  }
}; 