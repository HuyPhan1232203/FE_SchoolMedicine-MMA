import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MedicalColors } from "../../constants/Colors";
import { useAuth } from "../../hooks/useAuth";
import {
  UserProfile,
  approveUser,
  getPendingUsers,
  rejectUser,
} from "../../services/userService";

const { width } = Dimensions.get("window");

interface PendingRequest {
  id: string;
  type:
    | "user_registration"
    | "medication_request"
    | "vaccination_consent"
    | "health_checkup";
  title: string;
  description: string;
  requestedBy: string;
  requestedByName: string;
  createdAt: any;
  status: "pending" | "approved" | "rejected";
  data?: any;
}

export default function RequestApproval() {
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [otherRequests, setOtherRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<
    UserProfile | PendingRequest | null
  >(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "others">("users");
  const { userProfile } = useAuth();

  const loadPendingRequests = async () => {
    try {
      // Load pending users
      const pendingUsersList = await getPendingUsers();
      setPendingUsers(pendingUsersList);

      // Load other pending requests (mock data for now)
      const mockOtherRequests: PendingRequest[] = [
        {
          id: "1",
          type: "medication_request",
          title: "Yêu cầu gửi thuốc",
          description:
            "Phụ huynh Nguyễn Văn A yêu cầu gửi thuốc cảm cúm cho con",
          requestedBy: "parent_001",
          requestedByName: "Nguyễn Văn A",
          createdAt: new Date(),
          status: "pending",
          data: {
            studentName: "Nguyễn Văn B",
            studentId: "HS001",
            medication: "Thuốc cảm cúm",
            dosage: "1 viên/ngày",
            duration: "3 ngày",
            notes: "Uống sau ăn",
          },
        },
        {
          id: "2",
          type: "vaccination_consent",
          title: "Đồng ý tiêm chủng",
          description:
            "Phụ huynh Trần Thị B đồng ý cho con tiêm vaccine COVID-19",
          requestedBy: "parent_002",
          requestedByName: "Trần Thị B",
          createdAt: new Date(),
          status: "pending",
          data: {
            studentName: "Trần Văn C",
            studentId: "HS002",
            vaccineName: "COVID-19",
            scheduledDate: "2024-01-15",
            notes: "Không có dị ứng",
          },
        },
        {
          id: "3",
          type: "health_checkup",
          title: "Yêu cầu kiểm tra sức khỏe",
          description:
            "Phụ huynh Lê Văn D yêu cầu kiểm tra sức khỏe định kỳ cho con",
          requestedBy: "parent_003",
          requestedByName: "Lê Văn D",
          createdAt: new Date(),
          status: "pending",
          data: {
            studentName: "Lê Thị E",
            studentId: "HS003",
            checkupType: "Kiểm tra định kỳ",
            requestedDate: "2024-01-20",
            notes: "Kiểm tra tổng quát",
          },
        },
      ];
      setOtherRequests(mockOtherRequests);
    } catch (error) {
      console.error("Error loading pending requests:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadPendingRequests();
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleUserApproval = async (
    user: UserProfile,
    action: "approve" | "reject"
  ) => {
    if (!userProfile) return;

    try {
      if (action === "approve") {
        await approveUser(user.uid, userProfile.uid);
        Alert.alert("Thành công", `Đã phê duyệt tài khoản ${user.fullName}`);
      } else {
        Alert.prompt(
          "Lý do từ chối",
          "Vui lòng nhập lý do từ chối tài khoản:",
          async (reason) => {
            if (reason) {
              await rejectUser(user.uid, reason, userProfile.uid);
              Alert.alert(
                "Thành công",
                `Đã từ chối tài khoản ${user.fullName}`
              );
            }
          }
        );
      }

      setShowDetailModal(false);
      loadPendingRequests();
    } catch (error) {
      console.error("Error handling user approval:", error);
      Alert.alert("Lỗi", "Không thể thực hiện thao tác");
    }
  };

  const handleOtherRequestAction = async (
    request: PendingRequest,
    action: "approve" | "reject"
  ) => {
    try {
      // Mock approval/rejection - in real app, you'd update Firestore
      const updatedRequests = otherRequests.map((req) =>
        req.id === request.id
          ? {
              ...req,
              status:
                action === "approve"
                  ? ("approved" as const)
                  : ("rejected" as const),
            }
          : req
      );
      setOtherRequests(updatedRequests);

      Alert.alert(
        "Thành công",
        `Đã ${action === "approve" ? "phê duyệt" : "từ chối"} yêu cầu ${
          request.title
        }`
      );

      setShowDetailModal(false);
    } catch (error) {
      console.error("Error handling other request:", error);
      Alert.alert("Lỗi", "Không thể thực hiện thao tác");
    }
  };

  const renderUserItem = ({ item }: { item: UserProfile }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => {
        setSelectedRequest(item);
        setShowDetailModal(true);
      }}
    >
      <View style={styles.requestHeader}>
        <Text style={styles.requestTitle}>Đăng ký tài khoản mới</Text>
        <Text style={styles.requestTime}>{formatDate(item.createdAt)}</Text>
      </View>
      <View style={styles.requestBody}>
        <Text style={styles.requestDescription}>
          {item.fullName} đăng ký tài khoản với vai trò{" "}
          {item.role === "parent"
            ? "Phụ huynh"
            : item.role === "medical_staff"
            ? "Cán bộ Y tế"
            : "Quản trị viên"}
        </Text>
        <Text style={styles.requestEmail}>{item.email}</Text>
      </View>
      <View style={styles.requestFooter}>
        <Text style={styles.pendingBadge}>⏳ Chờ duyệt</Text>
      </View>
    </TouchableOpacity>
  );

  const renderOtherRequestItem = ({ item }: { item: PendingRequest }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => {
        setSelectedRequest(item);
        setShowDetailModal(true);
      }}
    >
      <View style={styles.requestHeader}>
        <Text style={styles.requestTitle}>{item.title}</Text>
        <Text style={styles.requestTime}>{formatDate(item.createdAt)}</Text>
      </View>
      <View style={styles.requestBody}>
        <Text style={styles.requestDescription}>{item.description}</Text>
        <Text style={styles.requestBy}>Bởi: {item.requestedByName}</Text>
      </View>
      <View style={styles.requestFooter}>
        <Text style={styles.pendingBadge}>⏳ Chờ duyệt</Text>
      </View>
    </TouchableOpacity>
  );

  const TabButton = ({
    title,
    isActive,
    onPress,
  }: {
    title: string;
    isActive: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.tabButtonActive]}
      onPress={onPress}
    >
      <Text
        style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MedicalColors.primary} />
        <Text style={styles.loadingText}>Đang tải yêu cầu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Duyệt Yêu Cầu</Text>
        <Text style={styles.headerSubtitle}>
          {activeTab === "users"
            ? `${pendingUsers.length} tài khoản chờ duyệt`
            : `${
                otherRequests.filter((r) => r.status === "pending").length
              } yêu cầu khác`}
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TabButton
          title={`Tài khoản (${pendingUsers.length})`}
          isActive={activeTab === "users"}
          onPress={() => setActiveTab("users")}
        />
        <TabButton
          title={`Yêu cầu khác (${
            otherRequests.filter((r) => r.status === "pending").length
          })`}
          isActive={activeTab === "others"}
          onPress={() => setActiveTab("others")}
        />
      </View>

      {/* Content */}
      <FlatList
        data={
          (activeTab === "users"
            ? pendingUsers
            : otherRequests.filter((r) => r.status === "pending")) as any
        }
        renderItem={
          (activeTab === "users"
            ? renderUserItem
            : renderOtherRequestItem) as any
        }
        keyExtractor={(item: any) =>
          activeTab === "users"
            ? (item as UserProfile).uid
            : (item as PendingRequest).id
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === "users"
                ? "🎉 Không có tài khoản nào chờ duyệt"
                : "🎉 Không có yêu cầu nào chờ duyệt"}
            </Text>
          </View>
        }
      />

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chi tiết yêu cầu</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDetailModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {selectedRequest && activeTab === "users" && (
              <View>
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Họ tên:</Text>
                    <Text style={styles.detailValue}>
                      {(selectedRequest as UserProfile).fullName}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email:</Text>
                    <Text style={styles.detailValue}>
                      {(selectedRequest as UserProfile).email}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>SĐT:</Text>
                    <Text style={styles.detailValue}>
                      {(selectedRequest as UserProfile).phoneNumber || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Vai trò:</Text>
                    <Text style={styles.detailValue}>
                      {(selectedRequest as UserProfile).role === "parent"
                        ? "Phụ huynh"
                        : (selectedRequest as UserProfile).role ===
                          "medical_staff"
                        ? "Cán bộ Y tế"
                        : "Quản trị viên"}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Ngày đăng ký:</Text>
                    <Text style={styles.detailValue}>
                      {formatDate((selectedRequest as UserProfile).createdAt)}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() =>
                      handleUserApproval(
                        selectedRequest as UserProfile,
                        "approve"
                      )
                    }
                  >
                    <Text style={styles.actionButtonText}>✅ Phê duyệt</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() =>
                      handleUserApproval(
                        selectedRequest as UserProfile,
                        "reject"
                      )
                    }
                  >
                    <Text style={styles.actionButtonText}>❌ Từ chối</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {selectedRequest && activeTab === "others" && (
              <View>
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Thông tin yêu cầu</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Loại yêu cầu:</Text>
                    <Text style={styles.detailValue}>
                      {(selectedRequest as PendingRequest).title}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Người yêu cầu:</Text>
                    <Text style={styles.detailValue}>
                      {(selectedRequest as PendingRequest).requestedByName}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Thời gian:</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(
                        (selectedRequest as PendingRequest).createdAt
                      )}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Mô tả:</Text>
                    <Text style={styles.detailValue}>
                      {(selectedRequest as PendingRequest).description}
                    </Text>
                  </View>

                  {(selectedRequest as PendingRequest).data && (
                    <View style={styles.dataSection}>
                      <Text style={styles.sectionTitle}>Chi tiết</Text>
                      {Object.entries(
                        (selectedRequest as PendingRequest).data
                      ).map(([key, value]) => (
                        <View key={key} style={styles.detailRow}>
                          <Text style={styles.detailLabel}>{key}:</Text>
                          <Text style={styles.detailValue}>
                            {String(value)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() =>
                      handleOtherRequestAction(
                        selectedRequest as PendingRequest,
                        "approve"
                      )
                    }
                  >
                    <Text style={styles.actionButtonText}>✅ Phê duyệt</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() =>
                      handleOtherRequestAction(
                        selectedRequest as PendingRequest,
                        "reject"
                      )
                    }
                  >
                    <Text style={styles.actionButtonText}>❌ Từ chối</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MedicalColors.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: MedicalColors.backgroundSecondary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: MedicalColors.textSecondary,
  },
  header: {
    backgroundColor: MedicalColors.primary,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
    marginTop: 5,
  },
  tabsContainer: {
    flexDirection: "row",
    padding: 20,
    paddingBottom: 10,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: MedicalColors.backgroundCard,
    alignItems: "center",
    borderWidth: 1,
    borderColor: MedicalColors.borderMedium,
  },
  tabButtonActive: {
    backgroundColor: MedicalColors.primary,
    borderColor: MedicalColors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: MedicalColors.textSecondary,
  },
  tabButtonTextActive: {
    color: "#FFFFFF",
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  requestCard: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    flex: 1,
  },
  requestTime: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
  },
  requestBody: {
    marginBottom: 12,
  },
  requestDescription: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    lineHeight: 20,
  },
  requestEmail: {
    fontSize: 12,
    color: MedicalColors.textMuted,
    marginTop: 4,
  },
  requestBy: {
    fontSize: 12,
    color: MedicalColors.textMuted,
    marginTop: 4,
  },
  requestFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pendingBadge: {
    fontSize: 12,
    color: "#F39C12",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: MedicalColors.textSecondary,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: MedicalColors.backgroundSecondary,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    backgroundColor: MedicalColors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  modalContent: {
    padding: 20,
  },
  detailSection: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: MedicalColors.textPrimary,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  dataSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: MedicalColors.border,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  approveButton: {
    backgroundColor: "#27AE60",
  },
  rejectButton: {
    backgroundColor: "#E74C3C",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
