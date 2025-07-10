import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, initializeAuth } from 'firebase/auth';
import { firebaseConfig } from './config';

let auth: Auth;

// Initialize Firebase app if not already initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth - React Native automatically uses AsyncStorage
try {
  // Try to get existing auth instance
  auth = getAuth(app);
} catch (error) {
  // Initialize auth for React Native (AsyncStorage is used by default)
  auth = initializeAuth(app);
}

export { app, auth };

