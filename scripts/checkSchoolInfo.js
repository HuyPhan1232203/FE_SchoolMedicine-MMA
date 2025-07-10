// Check School Information in Firebase
// Run: node scripts/checkSchoolInfo.js

const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc } = require("firebase/firestore");

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

async function checkSchoolInfo() {
  try {
    console.log("🔍 Checking School Information...\n");

    const schoolDoc = await getDoc(doc(db, "system_config", "school_info"));

    if (schoolDoc.exists()) {
      const schoolData = schoolDoc.data();
      console.log("✅ School Information Found:");
      console.log("📚 Name:", schoolData.name);
      console.log("📍 Address:", schoolData.address);
      console.log("📞 Phone:", schoolData.phone);
      console.log("📧 Email:", schoolData.email);
      console.log("🌐 Website:", schoolData.website);
      console.log("📝 Description:", schoolData.description);
    } else {
      console.log("❌ School Information NOT Found!");
      console.log("💡 Run: node scripts/initialize-system.cjs to create it");
    }

    // Check notification settings
    const notificationDoc = await getDoc(
      doc(db, "system_config", "notification_settings")
    );
    console.log(
      "\n🔔 Notification Settings:",
      notificationDoc.exists() ? "✅ Found" : "❌ Not Found"
    );

    // Check system settings
    const systemDoc = await getDoc(doc(db, "system_config", "system_settings"));
    console.log(
      "⚙️ System Settings:",
      systemDoc.exists() ? "✅ Found" : "❌ Not Found"
    );
  } catch (error) {
    console.error("❌ Error checking school info:", error);
  }
}

checkSchoolInfo();
