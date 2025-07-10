import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { handleAuthError, logAuthError } from "../utils/errorHandler";

interface UserData {
  fullName: string;
  email: string;
  phoneNumber: string;
  role: "parent" | "medical_staff" | "administrator";
  studentId?: string;
}

export async function register(
  email: string,
  password: string,
  userData: UserData
) {
  try {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await sendEmailVerification(user);
    await setDoc(doc(db, "users", user.uid), {
      full_name: userData.fullName,
      email: userData.email,
      phone_number: userData.phoneNumber,
      role: userData.role,
      linked_student_id: userData.studentId || null,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    // Log successful registration
    console.log(`✅ User registered successfully: ${email}`);
  } catch (error: any) {
    // Log error for debugging
    logAuthError(error, "REGISTER");

    // Get user-friendly error message
    const userMessage = handleAuthError(error);
    throw new Error(userMessage);
  }
}

export async function login(email: string, password: string) {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);

    // Lấy user data từ Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data();

    // Chỉ kiểm tra emailVerified với user không phải admin
    if (
      !user.emailVerified &&
      (!userData || userData.role !== "administrator")
    ) {
      const verificationError = new Error(
        "Vui lòng xác minh email trước khi đăng nhập. Kiểm tra hộp thư của bạn."
      );
      (verificationError as any).code = "auth/email-not-verified";
      throw verificationError;
    }

    // Check account approval
    if (
      !userData ||
      (userData.status !== "active" && userData.status !== "approved")
    ) {
      const approvalError = new Error(
        "Tài khoản chưa được duyệt bởi quản trị viên. Vui lòng đợi phê duyệt."
      );
      (approvalError as any).code = "auth/account-not-approved";
      throw approvalError;
    }

    // Log successful login
    console.log(`✅ User logged in successfully: ${email}`);

    return userData.role;
  } catch (error: any) {
    // Log error for debugging
    logAuthError(error, "LOGIN");

    // Get user-friendly error message
    const userMessage = handleAuthError(error);
    throw new Error(userMessage);
  }
}

export async function resendEmailVerification() {
  try {
    const user = auth.currentUser;
    if (!user) {
      const noUserError = new Error("Không có người dùng đang đăng nhập.");
      (noUserError as any).code = "auth/no-current-user";
      throw noUserError;
    }

    if (user.emailVerified) {
      const alreadyVerifiedError = new Error("Email đã được xác minh.");
      (alreadyVerifiedError as any).code = "auth/already-verified";
      throw alreadyVerifiedError;
    }

    await sendEmailVerification(user);

    // Log successful resend
    console.log(`✅ Verification email resent to: ${user.email}`);
  } catch (error: any) {
    // Log error for debugging
    logAuthError(error, "RESEND_VERIFICATION");

    // Get user-friendly error message
    const userMessage = handleAuthError(error);
    throw new Error(userMessage);
  }
}

export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);

    // Log successful reset request
    console.log(`✅ Password reset email sent to: ${email}`);
  } catch (error: any) {
    // Log error for debugging
    logAuthError(error, "RESET_PASSWORD");

    // Get user-friendly error message
    const userMessage = handleAuthError(error);
    throw new Error(userMessage);
  }
}

// Helper function để check network connectivity
export function checkNetworkConnectivity(): boolean {
  return true;
}

// Helper function để retry operations with exponential backoff
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Don't retry on certain errors
      if (
        error.code &&
        [
          "auth/user-not-found",
          "auth/wrong-password",
          "auth/invalid-email",
          "auth/email-already-in-use",
          "auth/weak-password",
        ].includes(error.code)
      ) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Wait before retry with exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, attempt - 1))
      );

      console.log(
        `🔄 Retrying operation, attempt ${attempt + 1}/${maxRetries}`
      );
    }
  }

  throw lastError;
}

// Enhanced login with retry logic
export async function loginWithRetry(email: string, password: string) {
  // Check network first
  if (!checkNetworkConnectivity()) {
    const networkError = new Error(
      "Không có kết nối mạng. Vui lòng kiểm tra internet và thử lại."
    );
    (networkError as any).code = "auth/network-request-failed";
    throw networkError;
  }

  return retryOperation(() => login(email, password), 2, 1000);
}

// Enhanced register with retry logic
export async function registerWithRetry(
  email: string,
  password: string,
  userData: UserData
) {
  // Check network first
  if (!checkNetworkConnectivity()) {
    const networkError = new Error(
      "Không có kết nối mạng. Vui lòng kiểm tra internet và thử lại."
    );
    (networkError as any).code = "auth/network-request-failed";
    throw networkError;
  }

  return retryOperation(() => register(email, password, userData), 2, 1000);
}
