import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export interface ApprovalRequest {
  id: string;
  userId: string;
  userEmail: string;
  fullName: string;
  phoneNumber: string;
  requestedRole: "parent" | "medical_staff" | "administrator";
  requestType: "registration" | "role_change" | "access_request";
  reason: string;
  submittedAt: Timestamp;
  status: "pending" | "approved" | "rejected";
  documents?: string[];
  notes?: string;
  approvedBy?: string;
  approvedAt?: Timestamp;
  rejectedBy?: string;
  rejectedAt?: Timestamp;
  rejectionReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Create new approval request
export const createApprovalRequest = async (
  request: Omit<ApprovalRequest, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, "approval_requests"), {
      ...request,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating approval request:", error);
    throw error;
  }
};

// Get all approval requests
export const getApprovalRequests = async (): Promise<ApprovalRequest[]> => {
  try {
    const requestsRef = collection(db, "approval_requests");
    const q = query(requestsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as ApprovalRequest[];
  } catch (error) {
    console.error("Error getting approval requests:", error);
    throw error;
  }
};

// Get approval requests by status
export const getApprovalRequestsByStatus = async (
  status: ApprovalRequest["status"]
): Promise<ApprovalRequest[]> => {
  try {
    const requestsRef = collection(db, "approval_requests");
    const q = query(
      requestsRef,
      where("status", "==", status),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as ApprovalRequest[];
  } catch (error) {
    console.error("Error getting approval requests by status:", error);
    throw error;
  }
};

// Get approval requests by user
export const getApprovalRequestsByUser = async (
  userId: string
): Promise<ApprovalRequest[]> => {
  try {
    const requestsRef = collection(db, "approval_requests");
    const q = query(
      requestsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as ApprovalRequest[];
  } catch (error) {
    console.error("Error getting approval requests by user:", error);
    throw error;
  }
};

// Approve request
export const approveRequest = async (
  requestId: string,
  approvedBy: string,
  notes?: string
): Promise<void> => {
  try {
    const requestRef = doc(db, "approval_requests", requestId);
    const now = Timestamp.now();

    await updateDoc(requestRef, {
      status: "approved",
      approvedBy,
      approvedAt: now,
      notes,
      updatedAt: now,
    });
  } catch (error) {
    console.error("Error approving request:", error);
    throw error;
  }
};

// Reject request
export const rejectRequest = async (
  requestId: string,
  rejectedBy: string,
  rejectionReason: string
): Promise<void> => {
  try {
    const requestRef = doc(db, "approval_requests", requestId);
    const now = Timestamp.now();

    await updateDoc(requestRef, {
      status: "rejected",
      rejectedBy,
      rejectedAt: now,
      rejectionReason,
      updatedAt: now,
    });
  } catch (error) {
    console.error("Error rejecting request:", error);
    throw error;
  }
};

// Update request
export const updateApprovalRequest = async (
  requestId: string,
  updates: Partial<Omit<ApprovalRequest, "id" | "createdAt">>
): Promise<void> => {
  try {
    const requestRef = doc(db, "approval_requests", requestId);
    await updateDoc(requestRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating approval request:", error);
    throw error;
  }
};

// Delete request
export const deleteApprovalRequest = async (
  requestId: string
): Promise<void> => {
  try {
    const requestRef = doc(db, "approval_requests", requestId);
    await deleteDoc(requestRef);
  } catch (error) {
    console.error("Error deleting approval request:", error);
    throw error;
  }
};

// Get request statistics
export const getApprovalRequestStats = async (): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}> => {
  try {
    const requests = await getApprovalRequests();

    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === "pending").length,
      approved: requests.filter((r) => r.status === "approved").length,
      rejected: requests.filter((r) => r.status === "rejected").length,
    };
  } catch (error) {
    console.error("Error getting approval request stats:", error);
    throw error;
  }
};

// Initialize sample approval requests
export const initializeApprovalRequests = async (): Promise<void> => {
  try {
    const sampleRequests: Omit<
      ApprovalRequest,
      "id" | "createdAt" | "updatedAt"
    >[] = [
      {
        userId: "user1",
        userEmail: "nguyenvanan@gmail.com",
        fullName: "Nguyễn Văn An",
        phoneNumber: "0901234567",
        requestedRole: "parent",
        requestType: "registration",
        reason: "Đăng ký tài khoản để theo dõi sức khỏe con",
        submittedAt: Timestamp.now(),
        status: "pending",
        documents: ["CMND_front.jpg", "CMND_back.jpg"],
      },
      {
        userId: "user2",
        userEmail: "tranthilan@yahoo.com",
        fullName: "Trần Thị Lan",
        phoneNumber: "0912345678",
        requestedRole: "medical_staff",
        requestType: "role_change",
        reason: "Chuyển từ phụ huynh sang cán bộ y tế",
        submittedAt: Timestamp.now(),
        status: "pending",
        documents: ["CV.pdf", "Certificate.jpg"],
        notes: "Có kinh nghiệm 5 năm trong lĩnh vực y tế",
      },
      {
        userId: "user3",
        userEmail: "levancuong@hotmail.com",
        fullName: "Lê Văn Cường",
        phoneNumber: "0923456789",
        requestedRole: "parent",
        requestType: "registration",
        reason: "Đăng ký tài khoản phụ huynh",
        submittedAt: Timestamp.now(),
        status: "approved",
        documents: ["CMND_front.jpg"],
        approvedBy: "admin1",
        approvedAt: Timestamp.now(),
      },
      {
        userId: "user4",
        userEmail: "phamthidung@gmail.com",
        fullName: "Phạm Thị Dung",
        phoneNumber: "0934567890",
        requestedRole: "administrator",
        requestType: "access_request",
        reason: "Yêu cầu quyền quản trị hệ thống",
        submittedAt: Timestamp.now(),
        status: "rejected",
        documents: ["Authorization_letter.pdf"],
        notes: "Không đủ quyền hạn để cấp quyền admin",
        rejectedBy: "admin1",
        rejectedAt: Timestamp.now(),
        rejectionReason: "Không đủ quyền hạn để cấp quyền admin",
      },
    ];

    for (const request of sampleRequests) {
      await createApprovalRequest(request);
    }

    console.log("✅ Approval requests initialized successfully");
  } catch (error) {
    console.error("Error initializing approval requests:", error);
    throw error;
  }
};
