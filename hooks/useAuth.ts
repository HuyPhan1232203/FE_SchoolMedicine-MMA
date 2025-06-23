import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, usePathname } from 'expo-router';
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import {
    canUserAccess,
    getUserProfile,
    updateLastLogin,
    UserProfile,
    UserStatus
} from '../services/userService';

const LOGIN_EXPIRY_MINUTES = 60;

interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  canAccess: boolean;
  accessReason?: string;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [canAccess, setCanAccess] = useState(false);
  const [accessReason, setAccessReason] = useState<string>();
  const pathname = usePathname();

  useEffect(() => {
    // Use auth directly since it's already the Firebase Auth instance
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        try {
          // Check if email is verified
          if (!firebaseUser.emailVerified) {
            console.log('Email not verified');
            setUser(null);
            setUserProfile(null);
            setCanAccess(false);
            setAccessReason('Email chưa được xác thực');
            // Only redirect to EmailVerification if not already there
            if (pathname !== '/EmailVerification') {
              router.replace('/EmailVerification');
            }
            setLoading(false);
            return;
          }

          // Check login expiry
          const loginTimeStr = await AsyncStorage.getItem("loginTime");
          const now = Date.now();
          if (loginTimeStr) {
            const loginTime = parseInt(loginTimeStr, 10);
            const diffMinutes = (now - loginTime) / 60000;
            if (diffMinutes > LOGIN_EXPIRY_MINUTES) {
              console.log('Login expired');
              await signOut(auth);
              await AsyncStorage.removeItem("loginTime");
              setUser(null);
              setUserProfile(null);
              setCanAccess(false);
              setAccessReason('Phiên đăng nhập đã hết hạn');
              router.replace('/Login');
              setLoading(false);
              return;
            }
          } else {
            // No login time recorded
            console.log('No login time found');
            await signOut(auth);
            setUser(null);
            setUserProfile(null);
            setCanAccess(false);
            setAccessReason('Không tìm thấy thông tin đăng nhập');
            router.replace('/Login');
            setLoading(false);
            return;
          }

          // Get user profile from Firestore
          const profile = await getUserProfile(firebaseUser.uid);
          
          if (!profile) {
            console.log('User profile not found');
            setUser(null);
            setUserProfile(null);
            setCanAccess(false);
            setAccessReason('Không tìm thấy thông tin tài khoản');
            router.replace('/Register'); // Redirect to complete profile
            setLoading(false);
            return;
          }

          // Check if user can access the system
          const accessCheck = canUserAccess(profile);
          
          setUser(firebaseUser);
          setUserProfile(profile);
          setCanAccess(accessCheck.canAccess);
          setAccessReason(accessCheck.reason);

          if (!accessCheck.canAccess) {
            console.log('Access denied:', accessCheck.reason);
            // Handle different redirect cases
            if (profile.status === UserStatus.PENDING) {
              // Create AccountPending screen later - for now go to login
              router.replace('/Login');
            } else if (profile.status === UserStatus.REJECTED || profile.status === UserStatus.SUSPENDED) {
              router.replace('/Login');
            }
          } else if (accessCheck.canAccess) {
            // Update last login time and set status to active
            await updateLastLogin(firebaseUser.uid);
            console.log('User authenticated and can access system');
          }

        } catch (error) {
          console.error('Error checking user status:', error);
          setUser(null);
          setUserProfile(null);
          setCanAccess(false);
          setAccessReason('Lỗi kiểm tra trạng thái tài khoản');
        }
      } else {
        // User is signed out
        setUser(null);
        setUserProfile(null);
        setCanAccess(false);
        setAccessReason(undefined);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { 
    user, 
    userProfile, 
    loading, 
    canAccess, 
    accessReason 
  };
} 