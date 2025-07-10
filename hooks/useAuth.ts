import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import {
  canUserAccess,
  getUserProfile,
  updateLastLogin,
  UserProfile,
} from "../services/userService";

const LOGIN_EXPIRY_MINUTES = 60;

export interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  canAccess: boolean;
  accessReason?: string;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  canAccessFeature: (feature: string) => boolean;
  isAdmin: () => boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [canAccess, setCanAccess] = useState(false);
  const [accessReason, setAccessReason] = useState<string>();

  useEffect(() => {
    console.log("🔄 useAuth useEffect triggered");

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      console.log(
        "Firebase auth state changed:",
        firebaseUser ? "User logged in" : "User logged out"
      );

      if (firebaseUser) {
        try {
          // Lấy user profile từ Firestore
          const profile = await getUserProfile(firebaseUser.uid);
          console.log(
            "User profile loaded:",
            profile ? "Success" : "Not found"
          );

          if (!profile) {
            console.log("User profile not found");
            setUser(null);
            setUserProfile(null);
            setCanAccess(false);
            setAccessReason("Không tìm thấy thông tin tài khoản");
            setLoading(false);
            return;
          }

          // Nếu không phải admin thì mới kiểm tra emailVerified
          if (!firebaseUser.emailVerified && profile.role !== "administrator") {
            console.log("Email not verified for non-admin user");
            setUser(null);
            setUserProfile(null);
            setCanAccess(false);
            setAccessReason("Email chưa được xác thực");
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
              console.log("Login expired, signing out");
              await signOut(auth);
              await AsyncStorage.removeItem("loginTime");
              setUser(null);
              setUserProfile(null);
              setCanAccess(false);
              setAccessReason("Phiên đăng nhập đã hết hạn");
              setLoading(false);
              return;
            }
          } else {
            // No login time recorded - set current time as login time
            console.log("No login time found, setting current time");
            await AsyncStorage.setItem("loginTime", now.toString());
          }

          // Check if user can access the system
          const accessCheck = canUserAccess(profile);
          console.log("Access check result:", accessCheck);

          setUser(firebaseUser);
          setUserProfile(profile);
          setCanAccess(accessCheck.canAccess);
          setAccessReason(accessCheck.reason);

          if (accessCheck.canAccess) {
            // Update last login time and set status to active
            await updateLastLogin(firebaseUser.uid);
            console.log("User authenticated and can access system");
          } else {
            console.log("Access denied:", accessCheck.reason);
          }
        } catch (error) {
          console.error("Error checking user status:", error);
          setUser(null);
          setUserProfile(null);
          setCanAccess(false);
          setAccessReason("Lỗi kiểm tra trạng thái tài khoản");
        }
      } else {
        // User is signed out
        console.log("User signed out");
        setUser(null);
        setUserProfile(null);
        setCanAccess(false);
        setAccessReason(undefined);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Permission checking utilities
  const hasPermission = (permission: string) => {
    if (!userProfile) return false;
    if (userProfile.permissions?.includes("*")) return true; // Admin has all permissions
    return userProfile.permissions?.includes(permission) || false;
  };

  const canAccessFeature = (feature: string) => {
    switch (feature) {
      case "user_management":
        return hasPermission("manage_users");
      case "drug_management":
        return hasPermission("manage_medicines");
      case "medical_events":
        return hasPermission("manage_events");
      case "system_config":
        return hasPermission("system_admin");
      case "import_users":
        return hasPermission("manage_users");
      case "approve_requests":
        return hasPermission("approve_requests");
      case "view_reports":
        return hasPermission("view_reports");
      default:
        return false;
    }
  };

  const isAdmin = () => {
    return userProfile?.role === "administrator";
  };

  const handleSignOut = async () => {
    try {
      console.log("Signing out user");
      // Clear all state first
      setUser(null);
      setUserProfile(null);
      setCanAccess(false);
      setAccessReason(undefined);

      // Clear AsyncStorage
      await AsyncStorage.removeItem("loginTime");

      // Sign out from Firebase
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return {
    user,
    userProfile,
    loading,
    canAccess,
    accessReason,
    hasPermission,
    canAccessFeature,
    isAdmin,
    signOut: handleSignOut,
  };
}
