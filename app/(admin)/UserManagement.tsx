import { collection, getDocs } from "firebase/firestore";
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MedicalColors } from "../../constants/Colors";
import { useAuth } from "../../hooks/useAuth";
import { db } from "../../lib/firebase";
import {
  UserProfile,
  UserRole,
  UserStatus,
  approveUser,
  getRoleDisplayName,
  getStatusDisplayInfo,
  rejectUser,
  suspendUser,
  updateUserStatus,
} from "../../services/userService";

const { width } = Dimensions.get("window");

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [rejectReason, setRejectReason] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const { userProfile } = useAuth();

  const loadUsers = async () => {
    try {
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);
      const usersList: UserProfile[] = [];

      usersSnapshot.forEach((doc) => {
        usersList.push(doc.data() as UserProfile);
      });

      // Sắp xếp theo thời gian tạo (mới nhất trước)
      usersList.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

      setUsers(usersList);
      setFilteredUsers(usersList);
    } catch (error) {
      console.error("Error loading users:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search query, status, and role
    let filtered = users;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.phoneNumber.includes(searchQuery)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, statusFilter, roleFilter, users]);

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleUserAction = async (
    action: "approve" | "reject" | "suspend" | "activate"
  ) => {
    if (!selectedUser || !userProfile) return;

    try {
      switch (action) {
        case "approve":
          await approveUser(selectedUser.uid, userProfile.uid);
          Alert.alert("Thành công", "Đã phê duyệt tài khoản");
          break;
        case "reject":
          if (!rejectReason.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập lý do từ chối");
            return;
          }
          await rejectUser(selectedUser.uid, rejectReason, userProfile.uid);
          Alert.alert("Thành công", "Đã từ chối tài khoản");
          break;
        case "suspend":
          if (!suspendReason.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập lý do tạm dừng");
            return;
          }
          await suspendUser(selectedUser.uid, suspendReason, userProfile.uid);
          Alert.alert("Thành công", "Đã tạm dừng tài khoản");
          break;
        case "activate":
          await updateUserStatus(
            selectedUser.uid,
            UserStatus.ACTIVE,
            userProfile.uid
          );
          Alert.alert("Thành công", "Đã kích hoạt tài khoản");
          break;
      }

      setShowActionModal(false);
      setRejectReason("");
      setSuspendReason("");
      loadUsers(); // Reload data
    } catch (error) {
      console.error("Error handling user action:", error);
      Alert.alert("Lỗi", "Không thể thực hiện thao tác");
    }
  };

  const renderUserItem = ({ item }: { item: UserProfile }) => {
    const statusInfo = getStatusDisplayInfo(item.status);

    return (
      <TouchableOpacity
        style={styles.userCard}
        onPress={() => {
          setSelectedUser(item);
          setShowUserModal(true);
        }}
      >
        <View style={styles.userCardHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.fullName}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
          </View>
          <View style={styles.userStatus}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.icon} {statusInfo.name}
            </Text>
          </View>
        </View>

        <View style={styles.userCardBody}>
          <View style={styles.userDetail}>
            <Text style={styles.userDetailLabel}>Vai trò:</Text>
            <Text style={styles.userDetailValue}>
              {getRoleDisplayName(item.role)}
            </Text>
          </View>
          <View style={styles.userDetail}>
            <Text style={styles.userDetailLabel}>SĐT:</Text>
            <Text style={styles.userDetailValue}>
              {item.phoneNumber || "N/A"}
            </Text>
          </View>
          <View style={styles.userDetail}>
            <Text style={styles.userDetailLabel}>Ngày tạo:</Text>
            <Text style={styles.userDetailValue}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const FilterButton = ({
    title,
    isActive,
    onPress,
  }: {
    title: string;
    isActive: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.filterButtonActive]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterButtonText,
          isActive && styles.filterButtonTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MedicalColors.primary} />
        <Text style={styles.loadingText}>Đang tải danh sách người dùng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Người dùng</Text>
        <Text style={styles.headerSubtitle}>
          Tổng cộng: {filteredUsers.length} người dùng
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm theo tên, email, SĐT..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Lọc theo trạng thái:</Text>
        <View style={styles.filtersRow}>
          <FilterButton
            title="Tất cả"
            isActive={statusFilter === "all"}
            onPress={() => setStatusFilter("all")}
          />
          <FilterButton
            title="Chờ duyệt"
            isActive={statusFilter === UserStatus.PENDING}
            onPress={() => setStatusFilter(UserStatus.PENDING)}
          />
          <FilterButton
            title="Hoạt động"
            isActive={statusFilter === UserStatus.ACTIVE}
            onPress={() => setStatusFilter(UserStatus.ACTIVE)}
          />
          <FilterButton
            title="Từ chối"
            isActive={statusFilter === UserStatus.REJECTED}
            onPress={() => setStatusFilter(UserStatus.REJECTED)}
          />
        </View>

        <Text style={styles.filtersTitle}>Lọc theo vai trò:</Text>
        <View style={styles.filtersRow}>
          <FilterButton
            title="Tất cả"
            isActive={roleFilter === "all"}
            onPress={() => setRoleFilter("all")}
          />
          <FilterButton
            title="Phụ huynh"
            isActive={roleFilter === UserRole.PARENT}
            onPress={() => setRoleFilter(UserRole.PARENT)}
          />
          <FilterButton
            title="Y tế"
            isActive={roleFilter === UserRole.MEDICAL_STAFF}
            onPress={() => setRoleFilter(UserRole.MEDICAL_STAFF)}
          />
          <FilterButton
            title="Admin"
            isActive={roleFilter === UserRole.ADMINISTRATOR}
            onPress={() => setRoleFilter(UserRole.ADMINISTRATOR)}
          />
        </View>
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.uid}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* User Detail Modal */}
      <Modal
        visible={showUserModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowUserModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chi tiết người dùng</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowUserModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          {selectedUser && (
            <View style={styles.modalContent}>
              <View style={styles.userDetailSection}>
                <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Họ tên:</Text>
                  <Text style={styles.detailValue}>
                    {selectedUser.fullName}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{selectedUser.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>SĐT:</Text>
                  <Text style={styles.detailValue}>
                    {selectedUser.phoneNumber || "N/A"}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Vai trò:</Text>
                  <Text style={styles.detailValue}>
                    {getRoleDisplayName(selectedUser.role)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Trạng thái:</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      {
                        color: getStatusDisplayInfo(selectedUser.status).color,
                      },
                    ]}
                  >
                    {getStatusDisplayInfo(selectedUser.status).icon}{" "}
                    {getStatusDisplayInfo(selectedUser.status).name}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Ngày tạo:</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(selectedUser.createdAt)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Cập nhật lần cuối:</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(selectedUser.updatedAt)}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {selectedUser.status === UserStatus.PENDING && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => {
                        setShowUserModal(false);
                        setShowActionModal(true);
                      }}
                    >
                      <Text style={styles.actionButtonText}>✅ Phê duyệt</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => {
                        setShowUserModal(false);
                        setShowActionModal(true);
                      }}
                    >
                      <Text style={styles.actionButtonText}>❌ Từ chối</Text>
                    </TouchableOpacity>
                  </>
                )}

                {selectedUser.status === UserStatus.ACTIVE && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.suspendButton]}
                    onPress={() => {
                      setShowUserModal(false);
                      setShowActionModal(true);
                    }}
                  >
                    <Text style={styles.actionButtonText}>⛔ Tạm dừng</Text>
                  </TouchableOpacity>
                )}

                {(selectedUser.status === UserStatus.SUSPENDED ||
                  selectedUser.status === UserStatus.INACTIVE) && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.activateButton]}
                    onPress={() => handleUserAction("activate")}
                  >
                    <Text style={styles.actionButtonText}>🟢 Kích hoạt</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* Action Modal */}
      <Modal
        visible={showActionModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowActionModal(false)}
      >
        <View style={styles.actionModalOverlay}>
          <View style={styles.actionModalContent}>
            <Text style={styles.actionModalTitle}>
              {selectedUser?.status === UserStatus.PENDING
                ? "Xác nhận thao tác"
                : "Nhập lý do"}
            </Text>

            {selectedUser?.status === UserStatus.PENDING && (
              <View style={styles.actionModalButtons}>
                <TouchableOpacity
                  style={[styles.actionModalButton, styles.approveButton]}
                  onPress={() => handleUserAction("approve")}
                >
                  <Text style={styles.actionButtonText}>✅ Phê duyệt</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionModalButton, styles.rejectButton]}
                  onPress={() => {
                    // Show reject reason input
                    setShowActionModal(false);
                    Alert.prompt(
                      "Lý do từ chối",
                      "Vui lòng nhập lý do từ chối tài khoản:",
                      (text) => {
                        setRejectReason(text || "");
                        handleUserAction("reject");
                      }
                    );
                  }}
                >
                  <Text style={styles.actionButtonText}>❌ Từ chối</Text>
                </TouchableOpacity>
              </View>
            )}

            {selectedUser?.status === UserStatus.ACTIVE && (
              <View style={styles.actionModalButtons}>
                <TouchableOpacity
                  style={[styles.actionModalButton, styles.suspendButton]}
                  onPress={() => {
                    setShowActionModal(false);
                    Alert.prompt(
                      "Lý do tạm dừng",
                      "Vui lòng nhập lý do tạm dừng tài khoản:",
                      (text) => {
                        setSuspendReason(text || "");
                        handleUserAction("suspend");
                      }
                    );
                  }}
                >
                  <Text style={styles.actionButtonText}>⛔ Tạm dừng</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[styles.actionModalButton, styles.cancelButton]}
              onPress={() => setShowActionModal(false)}
            >
              <Text style={styles.actionButtonText}>Hủy</Text>
            </TouchableOpacity>
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
  searchContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchInput: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: MedicalColors.borderMedium,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    marginBottom: 8,
    marginTop: 10,
  },
  filtersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: MedicalColors.backgroundCard,
    borderWidth: 1,
    borderColor: MedicalColors.borderMedium,
  },
  filterButtonActive: {
    backgroundColor: MedicalColors.primary,
    borderColor: MedicalColors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  listContainer: {
    padding: 20,
  },
  userCard: {
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
  userCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
  },
  userEmail: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    marginTop: 2,
  },
  userStatus: {
    alignItems: "flex-end",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  userCardBody: {
    borderTopWidth: 1,
    borderTopColor: MedicalColors.border,
    paddingTop: 12,
  },
  userDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  userDetailLabel: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
    fontWeight: "500",
  },
  userDetailValue: {
    fontSize: 12,
    color: MedicalColors.textPrimary,
    fontWeight: "600",
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
  userDetailSection: {
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
  actionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    minWidth: (width - 60) / 2,
  },
  approveButton: {
    backgroundColor: "#27AE60",
  },
  rejectButton: {
    backgroundColor: "#E74C3C",
  },
  suspendButton: {
    backgroundColor: "#E67E22",
  },
  activateButton: {
    backgroundColor: "#27AE60",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  actionModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionModalContent: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 12,
    padding: 20,
    width: width * 0.8,
    maxWidth: 300,
  },
  actionModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    textAlign: "center",
    marginBottom: 20,
  },
  actionModalButtons: {
    gap: 12,
  },
  actionModalButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#95A5A6",
    marginTop: 12,
  },
});
