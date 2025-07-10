import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, usePathname } from "expo-router";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import {
  canUserAccess,
  getUserProfile,
  updateLastLogin,
  UserProfile,
  UserStatus,
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
  const pathname = usePathname();

  useEffect(() => {
    // Use auth directly since it's already the Firebase Auth instance
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      if (firebaseUser) {
        try {
          // Lấy user profile từ Firestore trước
          const profile = await getUserProfile(firebaseUser.uid);

          if (!profile) {
            console.log("User profile not found");
            setUser(null);
            setUserProfile(null);
            setCanAccess(false);
            setAccessReason("Không tìm thấy thông tin tài khoản");
            router.replace("/Register"); // Redirect to complete profile
            setLoading(false);
            return;
          }

          // Nếu không phải admin thì mới kiểm tra emailVerified
          if (!firebaseUser.emailVerified && profile.role !== "administrator") {
            console.log("Email not verified");
            setUser(null);
            setUserProfile(null);
            setCanAccess(false);
            setAccessReason("Email chưa được xác thực");
            // Only redirect to EmailVerification if not already there
            if (pathname !== "/EmailVerification") {
              router.replace("/EmailVerification");
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
              console.log("Login expired");
              await signOut(auth);
              await AsyncStorage.removeItem("loginTime");
              setUser(null);
              setUserProfile(null);
              setCanAccess(false);
              setAccessReason("Phiên đăng nhập đã hết hạn");
              router.replace("/Login");
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

          setUser(firebaseUser);
          setUserProfile(profile);
          setCanAccess(accessCheck.canAccess);
          setAccessReason(accessCheck.reason);

          if (!accessCheck.canAccess) {
            console.log("Access denied:", accessCheck.reason);
            // Handle different redirect cases
            if (profile.status === UserStatus.PENDING) {
              // Create AccountPending screen later - for now go to login
              router.replace("/Login");
            } else if (
              profile.status === UserStatus.REJECTED ||
              profile.status === UserStatus.SUSPENDED
            ) {
              router.replace("/Login");
            }
            // else if (profile.mustChangePassword) {
            //   // Redirect to change password screen
            //   router.replace("/ChangePassword");
            // }
          } else if (accessCheck.canAccess) {
            // Update last login time and set status to active
            await updateLastLogin(firebaseUser.uid);

            // Log once to reduce spam
            if (!user || user.uid !== firebaseUser.uid) {
              console.log("User authenticated and can access system");
            }

            // Navigate based on user role - ONLY ONCE per login session
            const currentPath = pathname;

            if (profile.role === "administrator") {
              // Admin users go to admin dashboard
              if (
                currentPath === "/Login" ||
                currentPath === "/" ||
                currentPath === "/index" ||
                currentPath.startsWith("/(tabs)")
              ) {
                console.log("Redirecting admin to dashboard");
                router.replace("/(admin)/Dashboard");
              }
              // If already in admin area, don't redirect
            } else {
              // Regular users go to main app
              if (
                currentPath === "/Login" ||
                currentPath === "/" ||
                currentPath === "/index" ||
                currentPath.startsWith("/(admin)")
              ) {
                console.log("Redirecting user to main app");
                router.replace("/(tabs)/Home");
              }
              // If already in user area, don't redirect
            }
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
      // Clear all state first
      setUser(null);
      setUserProfile(null);
      setCanAccess(false);
      setAccessReason(undefined);

      // Clear AsyncStorage
      await AsyncStorage.removeItem("loginTime");

      // Sign out from Firebase
      await signOut(auth);

      // Navigate to login
      router.replace("/Login");
    } catch (error) {
      console.error("Error signing out:", error);
      // Even if there's an error, try to navigate to login
      router.replace("/Login");
    }
  };

  return {
    user,
    userProfile,
    loading,
    canAccess,
    hasPermission,
    canAccessFeature,
    isAdmin,
    signOut: handleSignOut,
  };
}
