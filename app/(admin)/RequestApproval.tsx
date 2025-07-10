import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CustomHeader from "../../components/CustomHeader";
import { MedicalColors, MedicalIcons } from "../../constants/Colors";
import { useAuth } from "../../hooks/useAuth";
import {
  ApprovalRequest,
  approveRequest,
  getApprovalRequests,
  getApprovalRequestStats,
  initializeApprovalRequests,
  rejectRequest,
} from "../../services/approvalService";

const { width } = Dimensions.get("window");

interface RequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function RequestApproval() {
  const { userProfile } = useAuth();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ApprovalRequest[]>(
    []
  );
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] =
    useState<ApprovalRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [typeFilter] = useState<
    "all" | "registration" | "role_change" | "access_request"
  >("all");
  const [rejectReason, setRejectReason] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");
  const [stats, setStats] = useState<RequestStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    if (
      userProfile &&
      !["administrator", "director", "manager"].includes(userProfile.role)
    ) {
      router.replace("/Login");
    }
  }, [userProfile]);

  useEffect(() => {
    loadRequests();
  }, []);

  // Reset request approval state when user changes
  useEffect(() => {
    if (userProfile) {
      loadRequests();
    }
  }, [userProfile?.uid]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const [requestsData, statsData] = await Promise.all([
        getApprovalRequests(),
        getApprovalRequestStats(),
      ]);

      setRequests(requestsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading requests:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (request) => request.requestType === typeFilter
      );
    }

    setFilteredRequests(filtered);
  };

  useEffect(() => {
    filterRequests();
  }, [statusFilter, typeFilter, requests]);

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return MedicalColors.warning;
      case "approved":
        return MedicalColors.success;
      case "rejected":
        return MedicalColors.error;
      default:
        return MedicalColors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ duyệt";
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Từ chối";
      default:
        return "Không xác định";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "approved":
        return "✅";
      case "rejected":
        return "❌";
      default:
        return "❓";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "registration":
        return "Đăng ký";
      case "role_change":
        return "Thay đổi vai trò";
      case "access_request":
        return "Yêu cầu quyền";
      default:
        return "Không xác định";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "parent":
        return "Phụ huynh";
      case "medical_staff":
        return "Cán bộ y tế";
      case "administrator":
        return "Quản trị viên";
      default:
        return "Không xác định";
    }
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

  const handleApprove = async () => {
    if (!selectedRequest || !userProfile) return;

    try {
      await approveRequest(
        selectedRequest.id,
        userProfile.fullName,
        approvalNotes
      );

      Alert.alert("Thành công", "Đã phê duyệt yêu cầu");
      setShowActionModal(false);
      setApprovalNotes("");
      loadRequests(); // Reload data
    } catch (error) {
      console.error("Error approving request:", error);
      Alert.alert("Lỗi", "Không thể phê duyệt yêu cầu");
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !userProfile) return;

    if (!rejectReason.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      await rejectRequest(
        selectedRequest.id,
        userProfile.fullName,
        rejectReason
      );

      Alert.alert("Thành công", "Đã từ chối yêu cầu");
      setShowActionModal(false);
      setRejectReason("");
      loadRequests(); // Reload data
    } catch (error) {
      console.error("Error rejecting request:", error);
      Alert.alert("Lỗi", "Không thể từ chối yêu cầu");
    }
  };

  const handleInitializeData = async () => {
    Alert.alert(
      "Khởi tạo dữ liệu",
      "Bạn có muốn tạo dữ liệu mẫu cho yêu cầu phê duyệt?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Khởi tạo",
          onPress: async () => {
            try {
              await initializeApprovalRequests();
              await loadRequests();
              Alert.alert("Thành công", "Đã tạo dữ liệu mẫu");
            } catch (error) {
              console.error("Error initializing data:", error);
              Alert.alert("Lỗi", "Không thể tạo dữ liệu mẫu");
            }
          },
        },
      ]
    );
  };

  const openRequestDetail = (request: ApprovalRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const openActionModal = (request: ApprovalRequest) => {
    setSelectedRequest(request);
    setShowActionModal(true);
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
      style={[styles.filterButton, isActive && styles.activeFilterButton]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterButtonText,
          isActive && styles.activeFilterButtonText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderRequestItem = ({ item }: { item: ApprovalRequest }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => openRequestDetail(item)}
    >
      <View style={styles.requestHeader}>
        <View style={styles.requestInfo}>
          <Text style={styles.requestTitle}>{item.fullName}</Text>
          <Text style={styles.requestEmail}>{item.userEmail}</Text>
          <Text style={styles.requestType}>
            {getTypeText(item.requestType)}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {getStatusIcon(item.status)} {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.requestBody}>
        <View style={styles.requestDetail}>
          <Text style={styles.detailLabel}>Vai trò yêu cầu:</Text>
          <Text style={styles.detailValue}>
            {getRoleText(item.requestedRole)}
          </Text>
        </View>
        <View style={styles.requestDetail}>
          <Text style={styles.detailLabel}>Số điện thoại:</Text>
          <Text style={styles.detailValue}>{item.phoneNumber}</Text>
        </View>
        <View style={styles.requestDetail}>
          <Text style={styles.detailLabel}>Ngày gửi:</Text>
          <Text style={styles.detailValue}>{formatDate(item.submittedAt)}</Text>
        </View>
        <Text style={styles.requestReason} numberOfLines={2}>
          {item.reason}
        </Text>
      </View>

      {item.status === "pending" && (
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => openActionModal(item)}
          >
            <Text style={styles.approveButtonText}>Duyệt</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => openActionModal(item)}
          >
            <Text style={styles.rejectButtonText}>Từ chối</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Duyệt yêu cầu"
        subtitle="Quản lý yêu cầu đăng ký và phân quyền"
        icon={<Text style={{ fontSize: 14 }}>{MedicalIcons.approval}</Text>}
        showBack={true}
        onBack={() => router.back()}
      />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MedicalColors.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <>
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Tổng cộng</Text>
            </View>
            <View style={styles.statCard}>
              <Text
                style={[styles.statNumber, { color: MedicalColors.warning }]}
              >
                {stats.pending}
              </Text>
              <Text style={styles.statLabel}>Chờ duyệt</Text>
            </View>
            <View style={styles.statCard}>
              <Text
                style={[styles.statNumber, { color: MedicalColors.success }]}
              >
                {stats.approved}
              </Text>
              <Text style={styles.statLabel}>Đã duyệt</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: MedicalColors.error }]}>
                {stats.rejected}
              </Text>
              <Text style={styles.statLabel}>Từ chối</Text>
            </View>
          </View>

          {/* Filters */}
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <FilterButton
                title="Tất cả"
                isActive={statusFilter === "all"}
                onPress={() => setStatusFilter("all")}
              />
              <FilterButton
                title="Chờ duyệt"
                isActive={statusFilter === "pending"}
                onPress={() => setStatusFilter("pending")}
              />
              <FilterButton
                title="Đã duyệt"
                isActive={statusFilter === "approved"}
                onPress={() => setStatusFilter("approved")}
              />
              <FilterButton
                title="Từ chối"
                isActive={statusFilter === "rejected"}
                onPress={() => setStatusFilter("rejected")}
              />
            </ScrollView>
          </View>

          {/* Requests List */}
          <View style={styles.listSection}>
            <Text style={styles.listSectionTitle}>
              📋 Danh sách yêu cầu ({filteredRequests.length})
            </Text>
            <FlatList
              data={filteredRequests}
              renderItem={renderRequestItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              showsVerticalScrollIndicator={false}
              ListFooterComponent={() => <View style={{ height: 150 }} />}
            />
          </View>

          {/* Request Detail Modal */}
          <Modal
            visible={showDetailModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowDetailModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Chi tiết yêu cầu</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowDetailModal(false)}
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  {selectedRequest && (
                    <>
                      <Text style={styles.detailTitle}>
                        {selectedRequest.fullName}
                      </Text>

                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>
                          Thông tin cơ bản
                        </Text>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabelModal}>Email:</Text>
                          <Text style={styles.detailValueModal}>
                            {selectedRequest.userEmail}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabelModal}>
                            Số điện thoại:
                          </Text>
                          <Text style={styles.detailValueModal}>
                            {selectedRequest.phoneNumber}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabelModal}>
                            Loại yêu cầu:
                          </Text>
                          <Text style={styles.detailValueModal}>
                            {getTypeText(selectedRequest.requestType)}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabelModal}>
                            Vai trò yêu cầu:
                          </Text>
                          <Text style={styles.detailValueModal}>
                            {getRoleText(selectedRequest.requestedRole)}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabelModal}>Ngày gửi:</Text>
                          <Text style={styles.detailValueModal}>
                            {formatDate(selectedRequest.submittedAt)}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabelModal}>
                            Trạng thái:
                          </Text>
                          <Text
                            style={[
                              styles.detailValueModal,
                              { color: getStatusColor(selectedRequest.status) },
                            ]}
                          >
                            {getStatusText(selectedRequest.status)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>
                          Lý do yêu cầu
                        </Text>
                        <Text style={styles.detailText}>
                          {selectedRequest.reason}
                        </Text>
                      </View>

                      {selectedRequest.documents &&
                        selectedRequest.documents.length > 0 && (
                          <View style={styles.detailSection}>
                            <Text style={styles.detailSectionTitle}>
                              Tài liệu đính kèm
                            </Text>
                            {selectedRequest.documents.map((doc, index) => (
                              <Text key={index} style={styles.documentItem}>
                                📎 {doc}
                              </Text>
                            ))}
                          </View>
                        )}

                      {selectedRequest.notes && (
                        <View style={styles.detailSection}>
                          <Text style={styles.detailSectionTitle}>Ghi chú</Text>
                          <Text style={styles.detailText}>
                            {selectedRequest.notes}
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowDetailModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Đóng</Text>
                  </TouchableOpacity>
                  {selectedRequest?.status === "pending" && (
                    <TouchableOpacity
                      style={styles.confirmButton}
                      onPress={() => {
                        setShowDetailModal(false);
                        openActionModal(selectedRequest);
                      }}
                    >
                      <Text style={styles.confirmButtonText}>Xử lý</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </Modal>

          {/* Action Modal */}
          <Modal
            visible={showActionModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowActionModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Xử lý yêu cầu</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowActionModal(false)}
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  {selectedRequest && (
                    <>
                      <Text style={styles.detailTitle}>
                        Yêu cầu của {selectedRequest.fullName}
                      </Text>

                      <View style={styles.actionSection}>
                        <Text style={styles.actionSectionTitle}>
                          Ghi chú (tùy chọn)
                        </Text>
                        <TextInput
                          style={styles.actionInput}
                          value={approvalNotes}
                          onChangeText={setApprovalNotes}
                          placeholder="Nhập ghi chú khi duyệt..."
                          multiline
                          numberOfLines={3}
                        />
                      </View>

                      <View style={styles.actionSection}>
                        <Text style={styles.actionSectionTitle}>
                          Lý do từ chối (nếu từ chối)
                        </Text>
                        <TextInput
                          style={styles.actionInput}
                          value={rejectReason}
                          onChangeText={setRejectReason}
                          placeholder="Nhập lý do từ chối..."
                          multiline
                          numberOfLines={3}
                        />
                      </View>
                    </>
                  )}
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowActionModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={handleReject}
                  >
                    <Text style={styles.rejectButtonText}>Từ chối</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={handleApprove}
                  >
                    <Text style={styles.approveButtonText}>Duyệt</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MedicalColors.background,
  },
  header: {
    backgroundColor: MedicalColors.primary,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  statsContainer: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: MedicalColors.borderMedium,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: MedicalColors.primary,
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 11,
    color: MedicalColors.textSecondary,
    textAlign: "center",
  },
  filterContainer: {
    backgroundColor: MedicalColors.backgroundCard,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MedicalColors.borderMedium,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: MedicalColors.borderMedium,
    backgroundColor: MedicalColors.background,
  },
  activeFilterButton: {
    backgroundColor: MedicalColors.primary,
    borderColor: MedicalColors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
  },
  activeFilterButtonText: {
    color: "white",
    fontWeight: "500",
  },
  listContainer: {
    padding: 12,
    paddingBottom: 200,
    backgroundColor: MedicalColors.background,
  },
  requestCard: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: MedicalColors.borderMedium,
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
    marginBottom: 10,
  },
  requestInfo: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 2,
  },
  requestEmail: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    marginBottom: 2,
  },
  requestType: {
    fontSize: 12,
    color: MedicalColors.primary,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "500",
  },
  requestBody: {
    marginBottom: 10,
  },
  requestDetail: {
    flexDirection: "row",
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
    width: 100,
  },
  detailValue: {
    fontSize: 12,
    color: MedicalColors.textPrimary,
    flex: 1,
  },
  requestReason: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
    fontStyle: "italic",
    marginTop: 5,
  },
  requestActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  approveButton: {
    backgroundColor: MedicalColors.success,
  },
  approveButtonText: {
    fontSize: 14,
    color: "white",
    fontWeight: "500",
  },
  rejectButton: {
    backgroundColor: MedicalColors.error,
  },
  rejectButtonText: {
    fontSize: 14,
    color: "white",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 16,
    width: width - 40,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: MedicalColors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: MedicalColors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 20,
    color: MedicalColors.textSecondary,
  },
  modalBody: {
    padding: 20,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabelModal: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    width: 120,
  },
  detailValueModal: {
    fontSize: 14,
    color: MedicalColors.textPrimary,
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    lineHeight: 20,
  },
  documentItem: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    marginBottom: 5,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: MedicalColors.border,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MedicalColors.border,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: MedicalColors.textSecondary,
    fontWeight: "500",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: MedicalColors.primary,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  actionSection: {
    marginBottom: 20,
  },
  actionSectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: MedicalColors.textPrimary,
    marginBottom: 8,
  },
  actionInput: {
    borderWidth: 1,
    borderColor: MedicalColors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: MedicalColors.inputBackground,
    textAlignVertical: "top",
  },
  listSection: {
    marginTop: 4,
    flex: 1,
  },
  listSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    marginHorizontal: 16,
    marginBottom: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: MedicalColors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: MedicalColors.textSecondary,
  },
});
