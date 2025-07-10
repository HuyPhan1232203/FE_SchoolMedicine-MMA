// Create Admin Complete - Tạo Auth + Firestore + Email Verified
// Run: node scripts/createAdminComplete.js

const { initializeApp } = require("firebase/app");
const {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} = require("firebase/auth");
const {
  doc,
  getFirestore,
  serverTimestamp,
  setDoc,
} = require("firebase/firestore");

// Firebase config từ lib/firebase/config.ts
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
const auth = getAuth(app);
const db = getFirestore(app);

// Admin accounts to create
const adminAccounts = [
  {
    email: "admin@school.edu.vn",
    password: "SchoolAdmin2025!",
    fullName: "Administrator",
    phoneNumber: "0999888777",
    permissions: ["*"], // All permissions
  },
  {
    email: "director@school.edu.vn",
    password: "Director2025!",
    fullName: "Hiệu trưởng",
    phoneNumber: "0888777666",
    permissions: ["manage_users", "view_reports", "system_admin"],
  },
  {
    email: "manager@school.edu.vn",
    password: "Manager2025!",
    fullName: "Quản lý hệ thống",
    phoneNumber: "0777666555",
    permissions: ["manage_users", "view_reports"],
  },
];

async function createAdminComplete() {
  console.log("🏥 Creating Complete Admin Accounts...\n");

  for (const adminData of adminAccounts) {
    try {
      console.log(`👤 Creating: ${adminData.email}`);

      // STEP 1: Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        adminData.email,
        adminData.password
      );

      const user = userCredential.user;
      console.log(`✅ Auth created: ${user.uid}`);

      // STEP 2: Update display name
      await updateProfile(user, {
        displayName: adminData.fullName,
      });
      console.log(`✅ Display name set`);

      // STEP 3: Create Firestore profile
      const userProfile = {
        uid: user.uid,
        email: adminData.email,
        fullName: adminData.fullName,
        phoneNumber: adminData.phoneNumber,
        role: "administrator",
        status: "active",
        permissions: adminData.permissions,
        approvedBy: "SYSTEM_SETUP",
        approvedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        emailVerified: false, // Sẽ update sau khi verify
        mustChangePassword: true,
      };

      await setDoc(doc(db, "users", user.uid), userProfile);
      console.log(`✅ Firestore profile created`);

      // STEP 4: Note về email verification
      console.log(
        `📧 Manual step: Verify email for ${adminData.email} in Firebase Console`
      );
      console.log(
        `📝 Login credentials: ${adminData.email} / ${adminData.password}\n`
      );
    } catch (error) {
      console.error(`❌ Error creating ${adminData.email}:`, error.message);

      // Common errors
      if (error.code === "auth/email-already-in-use") {
        console.log(`   → Email đã tồn tại. Skip hoặc xóa user cũ trước.\n`);
      }
    }
  }

  console.log("🎉 Admin creation completed!");
  console.log("\n📋 NEXT STEPS:");
  console.log("1. Vào Firebase Console → Authentication → Users");
  console.log('2. Click từng admin user → Edit → Tick "Email verified" → Save');
  console.log("3. Update Firestore: emailVerified: true");
  console.log("\n🔑 LOGIN CREDENTIALS:");

  adminAccounts.forEach((admin) => {
    console.log(`   ${admin.email} / ${admin.password}`);
  });
}

// Note về email verification
console.log(`
⚠️  LƯU Ý VỀ EMAIL VERIFICATION:

Firebase Client SDK không thể set emailVerified = true trực tiếp.
Cần manual steps:

1. Tạo users với script này
2. Vào Firebase Console → Authentication → Users  
3. Click user → Edit → Tick "Email verified" → Save
4. Hoặc dùng Firebase Admin SDK (cần service account key)

Script này tạo Auth + Firestore, còn email verification cần manual.
`);

createAdminComplete();
