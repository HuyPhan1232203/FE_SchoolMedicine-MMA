import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
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

const { width } = Dimensions.get("window");

interface MedicalEvent {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  type: "injury" | "illness" | "allergy" | "accident" | "other";
  location: string;
  date: string;
  time: string;
  reportedBy: string;
  status: "reported" | "investigating" | "resolved" | "closed";
  affectedStudents: string[];
  actions: string[];
  notes?: string;
}

interface EventForm {
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  type: "injury" | "illness" | "allergy" | "accident" | "other";
  location: string;
  affectedStudents: string;
  notes: string;
}

export default function EventReport() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<MedicalEvent | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "recent" | "critical"
  >("all");
  const [formData, setFormData] = useState<EventForm>({
    title: "",
    description: "",
    severity: "medium",
    type: "injury",
    location: "",
    affectedStudents: "",
    notes: "",
  });

  const userRole = userProfile?.role || "parent";

  // Mock data - would come from backend
  const medicalEvents: MedicalEvent[] = [
    {
      id: "1",
      title: "Chấn thương trong giờ thể dục",
      description:
        "Học sinh bị ngã trong lúc chạy bộ, có vết thương nhẹ ở đầu gối",
      severity: "medium",
      type: "injury",
      location: "Sân thể dục",
      date: "15/12/2024",
      time: "14:30",
      reportedBy: "GV. Nguyễn Văn An",
      status: "resolved",
      affectedStudents: ["Nguyễn Thị Bình - Lớp 10A1"],
      actions: ["Sơ cứu tại chỗ", "Gọi phụ huynh", "Đưa đến phòng y tế"],
      notes: "Học sinh đã được chăm sóc và về nhà an toàn",
    },
    {
      id: "2",
      title: "Phản ứng dị ứng thức ăn",
      description: "Học sinh có biểu hiện dị ứng sau khi ăn trưa",
      severity: "high",
      type: "allergy",
      location: "Căng tin trường",
      date: "14/12/2024",
      time: "12:15",
      reportedBy: "Y tá Trần Thị Lan",
      status: "investigating",
      affectedStudents: ["Lê Văn Cường - Lớp 11B2"],
      actions: [
        "Cho uống thuốc dị ứng",
        "Theo dõi triệu chứng",
        "Liên hệ phụ huynh",
      ],
      notes: "Cần kiểm tra thực đơn căng tin",
    },
    {
      id: "3",
      title: "Sốt cao đột ngột",
      description: "Học sinh bị sốt cao 39°C trong giờ học",
      severity: "high",
      type: "illness",
      location: "Lớp 12C3",
      date: "13/12/2024",
      time: "09:45",
      reportedBy: "GV. Phạm Thị Dung",
      status: "resolved",
      affectedStudents: ["Trần Văn Đức - Lớp 12C3"],
      actions: ["Đo nhiệt độ", "Cho uống hạ sốt", "Gọi phụ huynh đón"],
      notes: "Học sinh đã được đưa về nhà và khỏi bệnh",
    },
    {
      id: "4",
      title: "Tai nạn nhỏ trong phòng thí nghiệm",
      description: "Học sinh làm đổ hóa chất, không có thương tích",
      severity: "low",
      type: "accident",
      location: "Phòng thí nghiệm Hóa học",
      date: "12/12/2024",
      time: "15:20",
      reportedBy: "GV. Lý Văn Em",
      status: "closed",
      affectedStudents: ["Võ Thị Phương - Lớp 11A3"],
      actions: [
        "Dọn dẹp hóa chất",
        "Thông báo cho phụ huynh",
        "Cập nhật quy tắc an toàn",
      ],
      notes: "Sự cố đã được xử lý an toàn",
    },
  ];

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
        return MedicalColors.textSecondary;
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "low":
        return "Nhẹ";
      case "medium":
        return "Trung bình";
      case "high":
        return "Nghiêm trọng";
      case "critical":
        return "Khẩn cấp";
      default:
        return "Không xác định";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "injury":
        return "Chấn thương";
      case "illness":
        return "Bệnh tật";
      case "allergy":
        return "Dị ứng";
      case "accident":
        return "Tai nạn";
      case "other":
        return "Khác";
      default:
        return "Không xác định";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "reported":
        return MedicalColors.warning;
      case "investigating":
        return MedicalColors.primary;
      case "resolved":
        return MedicalColors.success;
      case "closed":
        return MedicalColors.textMuted;
      default:
        return MedicalColors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "reported":
        return "Đã báo cáo";
      case "investigating":
        return "Đang điều tra";
      case "resolved":
        return "Đã giải quyết";
      case "closed":
        return "Đã đóng";
      default:
        return "Không xác định";
    }
  };

  const getFilteredEvents = () => {
    switch (activeFilter) {
      case "recent":
        return medicalEvents.filter(
          (event) =>
            new Date(event.date.split("/").reverse().join("-")) >
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
      case "critical":
        return medicalEvents.filter(
          (event) => event.severity === "high" || event.severity === "critical"
        );
      default:
        return medicalEvents;
    }
  };

  const openEventDetail = (event: MedicalEvent) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  const handleCreateEvent = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn tạo báo cáo sự cố này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Tạo báo cáo",
        onPress: () => {
          Alert.alert("Thành công", "Đã tạo báo cáo sự cố thành công");
          setShowCreateModal(false);
          setFormData({
            title: "",
            description: "",
            severity: "medium",
            type: "injury",
            location: "",
            affectedStudents: "",
            notes: "",
          });
        },
      },
    ]);
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

  const SeverityButton = ({
    severity,
    isSelected,
    onPress,
  }: {
    severity: "low" | "medium" | "high" | "critical";
    isSelected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[
        styles.severityButton,
        { borderColor: getSeverityColor(severity) },
        isSelected && { backgroundColor: getSeverityColor(severity) + "20" },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.severityButtonText,
          { color: getSeverityColor(severity) },
          isSelected && { fontWeight: "bold" },
        ]}
      >
        {getSeverityText(severity)}
      </Text>
    </TouchableOpacity>
  );

  const TypeButton = ({
    type,
    isSelected,
    onPress,
  }: {
    type: "injury" | "illness" | "allergy" | "accident" | "other";
    isSelected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[
        styles.typeButton,
        isSelected && { backgroundColor: MedicalColors.primary + "20" },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.typeButtonText,
          isSelected && { color: MedicalColors.primary, fontWeight: "bold" },
        ]}
      >
        {getTypeText(type)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <CustomHeader
        title="Báo cáo sự cố"
        subtitle="Quản lý và theo dõi sự cố y tế"
        icon={<Text style={{ fontSize: 14 }}>{MedicalIcons.alert}</Text>}
        showBack={true}
        onBack={() => router.back()}
      />

      {/* Filter Buttons */}
      <View style={[styles.filterContainer, { marginTop: 8 }]}>
        <FilterButton
          title="Tất cả"
          isActive={activeFilter === "all"}
          onPress={() => setActiveFilter("all")}
        />
        <FilterButton
          title="Gần đây"
          isActive={activeFilter === "recent"}
          onPress={() => setActiveFilter("recent")}
        />
        <FilterButton
          title="Nghiêm trọng"
          isActive={activeFilter === "critical"}
          onPress={() => setActiveFilter("critical")}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{medicalEvents.length}</Text>
            <Text style={styles.statLabel}>Tổng sự cố</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {
                medicalEvents.filter(
                  (e) => e.severity === "high" || e.severity === "critical"
                ).length
              }
            </Text>
            <Text style={styles.statLabel}>Nghiêm trọng</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {
                medicalEvents.filter(
                  (e) => e.status === "resolved" || e.status === "closed"
                ).length
              }
            </Text>
            <Text style={styles.statLabel}>Đã giải quyết</Text>
          </View>
        </View>

        {/* Events List */}
        <View style={styles.eventsContainer}>
          <Text style={styles.sectionTitle}>📋 Danh sách sự cố</Text>
          {getFilteredEvents().map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => openEventDetail(event)}
            >
              <View style={styles.eventHeader}>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDescription}>
                    {event.description}
                  </Text>
                </View>
                <View
                  style={[
                    styles.severityBadge,
                    {
                      backgroundColor: getSeverityColor(event.severity) + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.severityText,
                      { color: getSeverityColor(event.severity) },
                    ]}
                  >
                    {getSeverityText(event.severity)}
                  </Text>
                </View>
              </View>

              <View style={styles.eventDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Loại:</Text>
                  <Text style={styles.detailValue}>
                    {getTypeText(event.type)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Địa điểm:</Text>
                  <Text style={styles.detailValue}>{event.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Thời gian:</Text>
                  <Text style={styles.detailValue}>
                    {event.date} - {event.time}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Báo cáo bởi:</Text>
                  <Text style={styles.detailValue}>{event.reportedBy}</Text>
                </View>
              </View>

              <View style={styles.eventFooter}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(event.status) + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(event.status) },
                    ]}
                  >
                    {getStatusText(event.status)}
                  </Text>
                </View>
                <Text style={styles.viewDetailText}>Xem chi tiết →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Create Event Button */}
      {(userRole === "medical_staff" || userRole === "administrator") && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonIcon}>+</Text>
          <Text style={styles.createButtonText}>Báo cáo sự cố mới</Text>
        </TouchableOpacity>
      )}

      {/* Create Event Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Báo cáo sự cố mới</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tiêu đề sự cố *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.title}
                  onChangeText={(text) =>
                    setFormData({ ...formData, title: text })
                  }
                  placeholder="Nhập tiêu đề sự cố"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mô tả chi tiết *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                  placeholder="Mô tả chi tiết sự cố..."
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mức độ nghiêm trọng</Text>
                <View style={styles.severityContainer}>
                  {(["low", "medium", "high", "critical"] as const).map(
                    (severity) => (
                      <SeverityButton
                        key={severity}
                        severity={severity}
                        isSelected={formData.severity === severity}
                        onPress={() => setFormData({ ...formData, severity })}
                      />
                    )
                  )}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Loại sự cố</Text>
                <View style={styles.typeContainer}>
                  {(
                    [
                      "injury",
                      "illness",
                      "allergy",
                      "accident",
                      "other",
                    ] as const
                  ).map((type) => (
                    <TypeButton
                      key={type}
                      type={type}
                      isSelected={formData.type === type}
                      onPress={() => setFormData({ ...formData, type })}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Địa điểm xảy ra</Text>
                <TextInput
                  style={styles.input}
                  value={formData.location}
                  onChangeText={(text) =>
                    setFormData({ ...formData, location: text })
                  }
                  placeholder="Nhập địa điểm"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Học sinh bị ảnh hưởng</Text>
                <TextInput
                  style={styles.input}
                  value={formData.affectedStudents}
                  onChangeText={(text) =>
                    setFormData({ ...formData, affectedStudents: text })
                  }
                  placeholder="Tên học sinh, lớp..."
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ghi chú bổ sung</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.notes}
                  onChangeText={(text) =>
                    setFormData({ ...formData, notes: text })
                  }
                  placeholder="Thông tin bổ sung..."
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleCreateEvent}
              >
                <Text style={styles.confirmButtonText}>Tạo báo cáo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Event Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết sự cố</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDetailModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedEvent && (
                <>
                  <Text style={styles.detailTitle}>{selectedEvent.title}</Text>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>
                      Thông tin cơ bản
                    </Text>
                    <Text style={styles.detailText}>
                      {selectedEvent.description}
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>
                      Chi tiết sự cố
                    </Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Mức độ:</Text>
                      <Text
                        style={[
                          styles.detailValue,
                          { color: getSeverityColor(selectedEvent.severity) },
                        ]}
                      >
                        {getSeverityText(selectedEvent.severity)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Loại:</Text>
                      <Text style={styles.detailValue}>
                        {getTypeText(selectedEvent.type)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Địa điểm:</Text>
                      <Text style={styles.detailValue}>
                        {selectedEvent.location}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Thời gian:</Text>
                      <Text style={styles.detailValue}>
                        {selectedEvent.date} - {selectedEvent.time}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Báo cáo bởi:</Text>
                      <Text style={styles.detailValue}>
                        {selectedEvent.reportedBy}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Trạng thái:</Text>
                      <Text
                        style={[
                          styles.detailValue,
                          { color: getStatusColor(selectedEvent.status) },
                        ]}
                      >
                        {getStatusText(selectedEvent.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>
                      Học sinh bị ảnh hưởng
                    </Text>
                    {selectedEvent.affectedStudents.map((student, index) => (
                      <Text key={index} style={styles.studentItem}>
                        • {student}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>
                      Hành động đã thực hiện
                    </Text>
                    {selectedEvent.actions.map((action, index) => (
                      <Text key={index} style={styles.actionItem}>
                        • {action}
                      </Text>
                    ))}
                  </View>

                  {selectedEvent.notes && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Ghi chú</Text>
                      <Text style={styles.detailText}>
                        {selectedEvent.notes}
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
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  Alert.alert(
                    "Cập nhật trạng thái",
                    "Trạng thái sự cố đã được cập nhật"
                  );
                  setShowDetailModal(false);
                }}
              >
                <Text style={styles.confirmButtonText}>
                  Cập nhật trạng thái
                </Text>
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
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: MedicalColors.border,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 5,
  },
  activeFilterButton: {
    backgroundColor: MedicalColors.primary + "20",
  },
  filterButtonText: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    fontWeight: "500",
  },
  activeFilterButtonText: {
    color: MedicalColors.primary,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: MedicalColors.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
    textAlign: "center",
  },
  eventsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 15,
  },
  eventCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  eventInfo: {
    flex: 1,
    marginRight: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 5,
  },
  eventDescription: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    lineHeight: 20,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 10,
    fontWeight: "500",
  },
  eventDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
    width: 80,
  },
  detailValue: {
    fontSize: 12,
    color: MedicalColors.textPrimary,
    flex: 1,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  viewDetailText: {
    fontSize: 12,
    color: MedicalColors.primary,
    fontWeight: "500",
  },
  createButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: MedicalColors.primary,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: MedicalColors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonIcon: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
    marginRight: 8,
  },
  createButtonText: {
    fontSize: 14,
    color: "white",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    width: width - 40,
    maxHeight: "90%",
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: MedicalColors.textPrimary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: MedicalColors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: MedicalColors.inputBackground,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  severityContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  severityButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 70,
    alignItems: "center",
  },
  severityButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MedicalColors.border,
    minWidth: 70,
    alignItems: "center",
  },
  typeButtonText: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
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
  detailText: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    lineHeight: 20,
  },
  studentItem: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    marginBottom: 5,
    paddingLeft: 10,
  },
  actionItem: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    marginBottom: 5,
    paddingLeft: 10,
  },
});
