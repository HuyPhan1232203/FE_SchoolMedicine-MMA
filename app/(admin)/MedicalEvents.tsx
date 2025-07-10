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
  createMedicalEvent,
  deleteMedicalEvent,
  getMedicalEvents,
  getMedicalEventStats,
  initializeMedicalEvents,
  MedicalEvent,
  MedicalEventStats,
  updateMedicalEvent,
} from "../../services/medicalEventService";

const { width } = Dimensions.get("window");

export default function MedicalEvents() {
  const { userProfile } = useAuth();
  const [events, setEvents] = useState<MedicalEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<MedicalEvent[]>([]);
  const [stats, setStats] = useState<MedicalEventStats>({
    total: 0,
    active: 0,
    resolved: 0,
    critical: 0,
    thisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<MedicalEvent | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "resolved" | "monitoring" | "closed"
  >("all");
  const [severityFilter, setSeverityFilter] = useState<
    "all" | "low" | "medium" | "high" | "critical"
  >("all");

  // New event form state
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    eventType: "other" as MedicalEvent["eventType"],
    severity: "low" as MedicalEvent["severity"],
    status: "active" as MedicalEvent["status"],
    location: "",
    affectedCount: "",
    actions: "",
    notes: "",
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
    loadData();
  }, []);

  // Reset medical events state when user changes
  useEffect(() => {
    if (userProfile) {
      loadData();
    }
  }, [userProfile?.uid]);

  useEffect(() => {
    filterEvents();
  }, [statusFilter, severityFilter, events]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, statsData] = await Promise.all([
        getMedicalEvents(),
        getMedicalEventStats(),
      ]);

      setEvents(eventsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading medical events:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu sự kiện y tế");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (statusFilter !== "all") {
      filtered = filtered.filter((event) => event.status === statusFilter);
    }

    if (severityFilter !== "all") {
      filtered = filtered.filter((event) => event.severity === severityFilter);
    }

    setFilteredEvents(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return MedicalColors.success;
      case "medium":
        return MedicalColors.warning;
      case "high":
        return MedicalColors.error;
      case "critical":
        return "#8B0000";
      default:
        return MedicalColors.textMuted;
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "low":
        return "Thấp";
      case "medium":
        return "Trung bình";
      case "high":
        return "Cao";
      case "critical":
        return "Nghiêm trọng";
      default:
        return "Không xác định";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return MedicalColors.error;
      case "resolved":
        return MedicalColors.success;
      case "monitoring":
        return MedicalColors.warning;
      case "closed":
        return MedicalColors.textMuted;
      default:
        return MedicalColors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Đang xử lý";
      case "resolved":
        return "Đã giải quyết";
      case "monitoring":
        return "Đang theo dõi";
      case "closed":
        return "Đã đóng";
      default:
        return "Không xác định";
    }
  };

  const getEventTypeText = (type: string) => {
    switch (type) {
      case "emergency":
        return "Khẩn cấp";
      case "routine":
        return "Thường xuyên";
      case "vaccination":
        return "Tiêm chủng";
      case "health_check":
        return "Khám sức khỏe";
      case "outbreak":
        return "Dịch bệnh";
      case "other":
        return "Khác";
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

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.description || !newEvent.location) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      const eventData: Omit<MedicalEvent, "id" | "createdAt" | "updatedAt"> = {
        title: newEvent.title,
        description: newEvent.description,
        eventType: newEvent.eventType,
        severity: newEvent.severity,
        status: newEvent.status,
        location: newEvent.location,
        affectedStudents: [],
        affectedCount: parseInt(newEvent.affectedCount) || 0,
        startDate: new Date() as any,
        reportedBy: userProfile?.fullName || "Admin",
        assignedTo: userProfile?.fullName || "Admin",
        actions: newEvent.actions
          ? newEvent.actions.split("\n").filter((a) => a.trim())
          : [],
        notes: newEvent.notes || "",
      };

      await createMedicalEvent(eventData);
      Alert.alert("Thành công", "Đã tạo sự kiện y tế mới");
      setShowAddModal(false);
      resetNewEventForm();
      loadData();
    } catch (error) {
      console.error("Error adding event:", error);
      Alert.alert("Lỗi", "Không thể tạo sự kiện y tế");
    }
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;

    try {
      await updateMedicalEvent(selectedEvent.id, {
        status: "resolved",
        endDate: new Date() as any,
      });
      Alert.alert("Thành công", "Đã cập nhật trạng thái sự kiện");
      setShowEditModal(false);
      loadData();
    } catch (error) {
      console.error("Error updating event:", error);
      Alert.alert("Lỗi", "Không thể cập nhật sự kiện");
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    Alert.alert("Xác nhận xóa", "Bạn có chắc muốn xóa sự kiện này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMedicalEvent(selectedEvent.id);
            Alert.alert("Thành công", "Đã xóa sự kiện");
            setShowDetailModal(false);
            loadData();
          } catch (error) {
            console.error("Error deleting event:", error);
            Alert.alert("Lỗi", "Không thể xóa sự kiện");
          }
        },
      },
    ]);
  };

  const handleInitializeData = async () => {
    Alert.alert(
      "Khởi tạo dữ liệu",
      "Bạn có muốn tạo dữ liệu mẫu cho sự kiện y tế?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Khởi tạo",
          onPress: async () => {
            try {
              await initializeMedicalEvents();
              await loadData();
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

  const resetNewEventForm = () => {
    setNewEvent({
      title: "",
      description: "",
      eventType: "other",
      severity: "low",
      status: "active",
      location: "",
      affectedCount: "",
      actions: "",
      notes: "",
    });
  };

  const renderEventItem = ({ item }: { item: MedicalEvent }) => (
    <TouchableOpacity
      style={[
        styles.eventCard,
        { borderLeftColor: getSeverityColor(item.severity) },
      ]}
      onPress={() => {
        setSelectedEvent(item);
        setShowDetailModal(true);
      }}
    >
      <View style={styles.eventHeader}>
        <View style={styles.eventHeaderLeft}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventType}>
            {getEventTypeText(item.eventType)}
          </Text>
        </View>
        <View style={styles.eventHeaderRight}>
          <View
            style={[
              styles.severityBadge,
              { backgroundColor: getSeverityColor(item.severity) + "20" },
            ]}
          >
            <Text
              style={[
                styles.severityText,
                { color: getSeverityColor(item.severity) },
              ]}
            >
              {getSeverityText(item.severity)}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.eventInfo}>
        <Text style={styles.eventDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.eventLocation}>
          📍 {item.location} • 👥 {item.affectedCount} người bị ảnh hưởng
        </Text>
        <Text style={styles.eventDate}>
          📅 Bắt đầu: {formatDate(item.startDate)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFilterChip = (
    label: string,
    value: string,
    currentFilter: string,
    onPress: (value: any) => void
  ) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        currentFilter === value && styles.activeFilterChip,
      ]}
      onPress={() => onPress(value)}
    >
      <Text
        style={[
          styles.filterChipText,
          currentFilter === value && styles.activeFilterChipText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MedicalColors.primary} />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <CustomHeader
        title="Sự kiện Y tế"
        subtitle="Quản lý sự kiện y tế học đường"
        icon={<Text style={{ fontSize: 14 }}>{MedicalIcons.alert}</Text>}
        showBack={true}
        onBack={() => router.back()}
      />

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Tổng cộng</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.active}</Text>
          <Text style={styles.statLabel}>Đang xử lý</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.critical}</Text>
          <Text style={styles.statLabel}>Nghiêm trọng</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.thisMonth}</Text>
          <Text style={styles.statLabel}>Tháng này</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Trạng thái:</Text>
            {renderFilterChip("Tất cả", "all", statusFilter, setStatusFilter)}
            {renderFilterChip(
              "Đang xử lý",
              "active",
              statusFilter,
              setStatusFilter
            )}
            {renderFilterChip(
              "Đã giải quyết",
              "resolved",
              statusFilter,
              setStatusFilter
            )}
            {renderFilterChip(
              "Theo dõi",
              "monitoring",
              statusFilter,
              setStatusFilter
            )}
          </View>
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Mức độ:</Text>
            {renderFilterChip(
              "Tất cả",
              "all",
              severityFilter,
              setSeverityFilter
            )}
            {renderFilterChip("Thấp", "low", severityFilter, setSeverityFilter)}
            {renderFilterChip(
              "Trung bình",
              "medium",
              severityFilter,
              setSeverityFilter
            )}
            {renderFilterChip("Cao", "high", severityFilter, setSeverityFilter)}
            {renderFilterChip(
              "Nghiêm trọng",
              "critical",
              severityFilter,
              setSeverityFilter
            )}
          </View>
        </ScrollView>
      </View>

      {/* Events List */}
      <FlatList
        data={filteredEvents}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.eventsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Initialize Data Button */}
      <TouchableOpacity
        style={styles.initializeButton}
        onPress={handleInitializeData}
      >
        <Text style={styles.initializeButtonText}>🔄 Khởi tạo dữ liệu mẫu</Text>
      </TouchableOpacity>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedEvent?.title}</Text>
            <Text style={styles.modalDescription}>
              {selectedEvent?.description}
            </Text>
            <View style={styles.modalInfoRow}>
              <Text style={styles.modalInfoLabel}>Mức độ:</Text>
              <View
                style={[
                  styles.severityBadge,
                  {
                    backgroundColor:
                      getSeverityColor(selectedEvent?.severity || "low") + "20",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.severityText,
                    {
                      color: getSeverityColor(selectedEvent?.severity || "low"),
                    },
                  ]}
                >
                  {getSeverityText(selectedEvent?.severity || "low")}
                </Text>
              </View>
            </View>
            <View style={styles.modalInfoRow}>
              <Text style={styles.modalInfoLabel}>Trạng thái:</Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      getStatusColor(selectedEvent?.status || "active") + "20",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: getStatusColor(selectedEvent?.status || "active"),
                    },
                  ]}
                >
                  {getStatusText(selectedEvent?.status || "active")}
                </Text>
              </View>
            </View>
            <View style={styles.modalInfoRow}>
              <Text style={styles.modalInfoLabel}>Loại sự kiện:</Text>
              <Text style={styles.modalInfoValue}>
                {getEventTypeText(selectedEvent?.eventType || "other")}
              </Text>
            </View>
            <View style={styles.modalInfoRow}>
              <Text style={styles.modalInfoLabel}>Vị trí:</Text>
              <Text style={styles.modalInfoValue}>
                {selectedEvent?.location || "N/A"}
              </Text>
            </View>
            <View style={styles.modalInfoRow}>
              <Text style={styles.modalInfoLabel}>Số lượng ảnh hưởng:</Text>
              <Text style={styles.modalInfoValue}>
                {selectedEvent?.affectedCount || 0} người
              </Text>
            </View>
            <View style={styles.modalInfoRow}>
              <Text style={styles.modalInfoLabel}>Người báo cáo:</Text>
              <Text style={styles.modalInfoValue}>
                {selectedEvent?.reportedBy || "N/A"}
              </Text>
            </View>
            <View style={styles.modalInfoRow}>
              <Text style={styles.modalInfoLabel}>Người phụ trách:</Text>
              <Text style={styles.modalInfoValue}>
                {selectedEvent?.assignedTo || "N/A"}
              </Text>
            </View>
            <View style={styles.modalInfoRow}>
              <Text style={styles.modalInfoLabel}>Hành động:</Text>
              <ScrollView style={styles.modalInfoValue}>
                {selectedEvent?.actions?.map((action, index) => (
                  <Text key={index} style={styles.actionItem}>
                    {action}
                  </Text>
                ))}
              </ScrollView>
            </View>
            <View style={styles.modalInfoRow}>
              <Text style={styles.modalInfoLabel}>Ghi chú:</Text>
              <Text style={styles.modalInfoValue}>
                {selectedEvent?.notes || "N/A"}
              </Text>
            </View>
            <View style={styles.modalInfoRow}>
              <Text style={styles.modalInfoLabel}>Ngày bắt đầu:</Text>
              <Text style={styles.modalInfoValue}>
                {formatDate(selectedEvent?.startDate)}
              </Text>
            </View>
            <View style={styles.modalInfoRow}>
              <Text style={styles.modalInfoLabel}>Ngày kết thúc:</Text>
              <Text style={styles.modalInfoValue}>
                {selectedEvent?.endDate
                  ? formatDate(selectedEvent.endDate)
                  : "N/A"}
              </Text>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={() => {
                  setSelectedEvent(null);
                  setShowDetailModal(false);
                }}
              >
                <Text style={styles.modalActionButtonText}>Đóng</Text>
              </TouchableOpacity>
              {selectedEvent?.status !== "resolved" && (
                <TouchableOpacity
                  style={styles.modalActionButton}
                  onPress={() => {
                    setSelectedEvent(null);
                    setShowDetailModal(false);
                    setShowEditModal(true);
                  }}
                >
                  <Text style={styles.modalActionButtonText}>Chỉnh sửa</Text>
                </TouchableOpacity>
              )}
              {selectedEvent?.status !== "resolved" && (
                <TouchableOpacity
                  style={styles.modalActionButton}
                  onPress={handleDeleteEvent}
                >
                  <Text style={styles.modalActionButtonText}>Xóa</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tạo sự kiện y tế mới</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Tiêu đề sự kiện"
              value={newEvent.title}
              onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Mô tả chi tiết"
              value={newEvent.description}
              onChangeText={(text) =>
                setNewEvent({ ...newEvent, description: text })
              }
              multiline
              numberOfLines={4}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Vị trí xảy ra"
              value={newEvent.location}
              onChangeText={(text) =>
                setNewEvent({ ...newEvent, location: text })
              }
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Số lượng ảnh hưởng (nếu có)"
              value={newEvent.affectedCount}
              onChangeText={(text) =>
                setNewEvent({ ...newEvent, affectedCount: text })
              }
              keyboardType="numeric"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Hành động cần thực hiện (nếu có)"
              value={newEvent.actions}
              onChangeText={(text) =>
                setNewEvent({ ...newEvent, actions: text })
              }
              multiline
              numberOfLines={3}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Ghi chú (nếu có)"
              value={newEvent.notes}
              onChangeText={(text) => setNewEvent({ ...newEvent, notes: text })}
              multiline
              numberOfLines={2}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalActionButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={handleAddEvent}
              >
                <Text style={styles.modalActionButtonText}>Tạo sự kiện</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chỉnh sửa sự kiện</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Tiêu đề sự kiện"
              value={selectedEvent?.title || ""}
              onChangeText={(text) => {
                if (selectedEvent) {
                  setSelectedEvent({ ...selectedEvent, title: text });
                }
              }}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Mô tả chi tiết"
              value={selectedEvent?.description || ""}
              onChangeText={(text) => {
                if (selectedEvent) {
                  setSelectedEvent({ ...selectedEvent, description: text });
                }
              }}
              multiline
              numberOfLines={4}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Vị trí xảy ra"
              value={selectedEvent?.location || ""}
              onChangeText={(text) => {
                if (selectedEvent) {
                  setSelectedEvent({ ...selectedEvent, location: text });
                }
              }}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Số lượng ảnh hưởng (nếu có)"
              value={selectedEvent?.affectedCount?.toString() || ""}
              onChangeText={(text) => {
                if (selectedEvent) {
                  setSelectedEvent({
                    ...selectedEvent,
                    affectedCount: parseInt(text) || 0,
                  });
                }
              }}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Hành động cần thực hiện (nếu có)"
              value={selectedEvent?.actions?.join("\n") || ""}
              onChangeText={(text) => {
                if (selectedEvent) {
                  setSelectedEvent({
                    ...selectedEvent,
                    actions: text.split("\n").filter((a) => a.trim()),
                  });
                }
              }}
              multiline
              numberOfLines={3}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Ghi chú (nếu có)"
              value={selectedEvent?.notes || ""}
              onChangeText={(text) => {
                if (selectedEvent) {
                  setSelectedEvent({ ...selectedEvent, notes: text });
                }
              }}
              multiline
              numberOfLines={2}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalActionButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={handleUpdateEvent}
              >
                <Text style={styles.modalActionButtonText}>Lưu thay đổi</Text>
              </TouchableOpacity>
            </View>
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
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: MedicalColors.backgroundSecondary,
  },
  loadingText: {
    marginTop: 10,
    color: MedicalColors.textSecondary,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    padding: 10,
    backgroundColor: MedicalColors.background,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCard: {
    alignItems: "center",
    padding: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
  },
  statLabel: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    marginTop: 5,
  },
  filtersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    backgroundColor: MedicalColors.background,
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginRight: 10,
  },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: MedicalColors.backgroundSecondary,
    marginRight: 10,
    borderWidth: 1,
    borderColor: MedicalColors.border,
  },
  activeFilterChip: {
    backgroundColor: MedicalColors.primary + "10",
    borderColor: MedicalColors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
  },
  activeFilterChipText: {
    color: MedicalColors.primary,
  },
  eventsList: {
    paddingBottom: 80, // Add padding for FAB
  },
  eventCard: {
    backgroundColor: MedicalColors.background,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  eventHeaderLeft: {
    flex: 1,
  },
  eventHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 5,
  },
  eventType: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
  },
  severityText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  eventInfo: {
    marginTop: 5,
  },
  eventDescription: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    marginBottom: 5,
  },
  eventLocation: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 12,
    color: MedicalColors.textMuted,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: MedicalColors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 30,
    color: "#fff",
  },
  initializeButton: {
    position: "absolute",
    bottom: 80, // Adjust position to be above FAB
    left: 20,
    backgroundColor: MedicalColors.warning,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  initializeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: MedicalColors.background,
    borderRadius: 15,
    padding: 25,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    textAlign: "center",
    marginBottom: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: MedicalColors.textSecondary,
    marginBottom: 20,
    textAlign: "justify",
  },
  modalInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalInfoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
  },
  modalInfoValue: {
    fontSize: 16,
    color: MedicalColors.textSecondary,
    flex: 1,
    textAlign: "right",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  modalActionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  modalActionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: MedicalColors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  actionItem: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    marginBottom: 5,
  },
});
