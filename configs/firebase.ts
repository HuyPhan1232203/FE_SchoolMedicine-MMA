// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "mma-297bc.firebaseapp.com",
  projectId: "mma-297bc",
  storageBucket: "mma-297bc.firebasestorage.app",
  messagingSenderId: "275882095501",
  appId: "1:275882095501:web:42aa23de207031090143c4",
  measurementId: "G-MZ7P1598DH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
