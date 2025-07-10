import { User } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";

// User Status Enum
export enum UserStatus {
  PENDING = "pending", // Chờ phê duyệt
  REJECTED = "rejected", // Bị từ chối
  SUSPENDED = "suspended", // Bị tạm dừng
  ACTIVE = "active", // Đang hoạt động (đã đăng nhập)
  INACTIVE = "inactive", // Không hoạt động
  APPROVED = "approved", // Đã được phê duyệt
}

// User Roles
export enum UserRole {
  PARENT = "parent",
  MEDICAL_STAFF = "medical_staff",
  ADMINISTRATOR = "administrator",
}

// User Profile Interface
export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  status: UserStatus;
  studentId?: string; // Chỉ cho phụ huynh
  department?: string; // Chỉ cho medical staff
  permissions?: string[]; // Chỉ cho administrator
  approvedBy?: string; // ID của admin phê duyệt
  approvedAt?: Timestamp; // Thời gian phê duyệt
  rejectedReason?: string; // Lý do từ chối
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
  mustChangePassword?: boolean; // Yêu cầu đổi mật khẩu
  emailVerified?: boolean; // Trạng thái xác thực email
  // Thêm các trường mới
  position?: string; // Chức vụ
  address?: string; // Địa chỉ
  emergencyContact?: string; // Liên hệ khẩn cấp
  emergencyPhone?: string; // SĐT khẩn cấp
  bio?: string; // Tiểu sử
  phone?: string; // Alias cho phoneNumber
}

// Create user profile
export const createUserProfile = async (
  user: User,
  additionalData: Partial<UserProfile>
): Promise<void> => {
  const userRef = doc(db, "users", user.uid);

  const userData: UserProfile = {
    uid: user.uid,
    email: user.email || "",
    fullName: additionalData.fullName || "",
    phoneNumber: additionalData.phoneNumber || "",
    role: additionalData.role || UserRole.PARENT,
    status: UserStatus.PENDING, // Mặc định là chờ phê duyệt
    studentId: additionalData.studentId,
    department: additionalData.department,
    permissions: additionalData.permissions || [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    ...additionalData,
  };

  await setDoc(userRef, userData);
};

// Get user profile
export const getUserProfile = async (
  uid: string
): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

// Update user status
export const updateUserStatus = async (
  uid: string,
  status: UserStatus,
  approvedBy?: string,
  rejectedReason?: string
): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    const updateData: Partial<UserProfile> = {
      status,
      updatedAt: Timestamp.now(),
    };

    if (status === UserStatus.ACTIVE && approvedBy) {
      updateData.approvedBy = approvedBy;
      updateData.approvedAt = Timestamp.now();
    }

    if (status === UserStatus.REJECTED && rejectedReason) {
      updateData.rejectedReason = rejectedReason;
    }

    await updateDoc(userRef, updateData);
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error;
  }
};

// Update last login time
export const updateLastLogin = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);

    // Get current user data to check role
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    const updateData: any = {
      lastLoginAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Only update status to ACTIVE for non-admin users
    if (userData && userData.role !== "administrator") {
      updateData.status = UserStatus.ACTIVE;
    }

    await updateDoc(userRef, updateData);
  } catch (error) {
    console.error("Error updating last login:", error);
    throw error;
  }
};

// Update user's mustChangePassword status
export const updateMustChangePassword = async (
  uid: string,
  mustChange: boolean = false
): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      mustChangePassword: mustChange,
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ Updated mustChangePassword for user ${uid}: ${mustChange}`);
  } catch (error) {
    console.error("Error updating mustChangePassword:", error);
    throw new Error("Không thể cập nhật trạng thái đổi mật khẩu");
  }
};

// Check if user can access the system
export const canUserAccess = (
  userProfile: UserProfile
): {
  canAccess: boolean;
  reason?: string;
  redirectTo?: string;
} => {
  // Kiểm tra email verification
  // Note: Cần check từ Firebase Auth user object

  // Kiểm tra yêu cầu đổi mật khẩu (tạm thời tắt để admin có thể đăng nhập)
  // if (userProfile.mustChangePassword) {
  //   return {
  //     canAccess: false,
  //     reason: "Bạn cần đổi mật khẩu trước khi sử dụng hệ thống",
  //     redirectTo: "/ChangePassword",
  //   };
  // }

  switch (userProfile.status) {
    case UserStatus.PENDING:
      return {
        canAccess: false,
        reason: "Tài khoản đang chờ phê duyệt bởi quản trị viên",
        redirectTo: "/AccountPending",
      };

    case UserStatus.REJECTED:
      return {
        canAccess: false,
        reason: `Tài khoản đã bị từ chối. Lý do: ${
          userProfile.rejectedReason || "Không có lý do cụ thể"
        }`,
        redirectTo: "/AccountRejected",
      };

    case UserStatus.SUSPENDED:
      return {
        canAccess: false,
        reason: "Tài khoản đã bị tạm dừng. Vui lòng liên hệ quản trị viên",
        redirectTo: "/AccountSuspended",
      };

    case UserStatus.ACTIVE:
    case UserStatus.APPROVED: // Thêm xử lý cho status APPROVED
      return {
        canAccess: true,
      };

    case UserStatus.INACTIVE:
      return {
        canAccess: true, // Có thể đăng nhập nhưng cần kích hoạt lại
      };

    default:
      return {
        canAccess: false,
        reason: "Trạng thái tài khoản không hợp lệ",
        redirectTo: "/Login",
      };
  }
};

// Get pending users for admin approval
export const getPendingUsers = async (): Promise<UserProfile[]> => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("status", "==", UserStatus.PENDING));
    const querySnapshot = await getDocs(q);

    const pendingUsers: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      pendingUsers.push(doc.data() as UserProfile);
    });

    return pendingUsers;
  } catch (error) {
    console.error("Error getting pending users:", error);
    throw error;
  }
};

// Get users by role
export const getUsersByRole = async (
  role: UserRole
): Promise<UserProfile[]> => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", role));
    const querySnapshot = await getDocs(q);

    const users: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as UserProfile);
    });

    return users;
  } catch (error) {
    console.error("Error getting users by role:", error);
    throw error;
  }
};

// Approve user (for administrators)
export const approveUser = async (
  uid: string,
  approvedByUid: string
): Promise<void> => {
  try {
    await updateUserStatus(uid, UserStatus.ACTIVE, approvedByUid);

    // Có thể gửi email thông báo ở đây
    // await sendApprovalNotification(uid);
  } catch (error) {
    console.error("Error approving user:", error);
    throw error;
  }
};

// Reject user (for administrators)
export const rejectUser = async (
  uid: string,
  reason: string,
  rejectedByUid: string
): Promise<void> => {
  try {
    await updateUserStatus(uid, UserStatus.REJECTED, rejectedByUid, reason);

    // Có thể gửi email thông báo ở đây
    // await sendRejectionNotification(uid, reason);
  } catch (error) {
    console.error("Error rejecting user:", error);
    throw error;
  }
};

// Suspend user (for administrators)
export const suspendUser = async (
  uid: string,
  reason: string,
  suspendedByUid: string
): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      status: UserStatus.SUSPENDED,
      suspendedReason: reason,
      suspendedBy: suspendedByUid,
      suspendedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error suspending user:", error);
    throw error;
  }
};

// Check user permissions
export const hasPermission = (
  userProfile: UserProfile,
  permission: string
): boolean => {
  // Administrator có tất cả quyền
  if (userProfile.role === UserRole.ADMINISTRATOR) {
    return true;
  }

  // Medical staff có một số quyền nhất định
  if (userProfile.role === UserRole.MEDICAL_STAFF) {
    const medicalStaffPermissions = [
      "view_health_records",
      "create_health_reports",
      "manage_vaccinations",
      "view_student_list",
    ];
    return medicalStaffPermissions.includes(permission);
  }

  // Parent chỉ có quyền xem con mình
  if (userProfile.role === UserRole.PARENT) {
    const parentPermissions = [
      "view_own_child_health",
      "receive_notifications",
    ];
    return parentPermissions.includes(permission);
  }

  return userProfile.permissions?.includes(permission) || false;
};

// Role display names
export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case UserRole.PARENT:
      return "Phụ huynh";
    case UserRole.MEDICAL_STAFF:
      return "Cán bộ Y tế";
    case UserRole.ADMINISTRATOR:
      return "Quản trị viên";
    default:
      return "Không xác định";
  }
};

// Status display names and colors
export const getStatusDisplayInfo = (
  status: UserStatus
): {
  name: string;
  color: string;
  icon: string;
} => {
  switch (status) {
    case UserStatus.PENDING:
      return {
        name: "Chờ phê duyệt",
        color: "#F39C12",
        icon: "⏳",
      };
    case UserStatus.REJECTED:
      return {
        name: "Đã từ chối",
        color: "#E74C3C",
        icon: "❌",
      };
    case UserStatus.SUSPENDED:
      return {
        name: "Đã tạm dừng",
        color: "#E67E22",
        icon: "⛔",
      };
    case UserStatus.ACTIVE:
      return {
        name: "Đang hoạt động",
        color: "#2ECC71",
        icon: "🟢",
      };
    case UserStatus.INACTIVE:
      return {
        name: "Không hoạt động",
        color: "#95A5A6",
        icon: "⚪",
      };
    default:
      return {
        name: "Không xác định",
        color: "#BDC3C7",
        icon: "❓",
      };
  }
};
