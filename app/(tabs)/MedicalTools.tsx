import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
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

interface MedicalTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: "health_check" | "vital_signs" | "medication" | "emergency";
  action: () => void;
}

interface HealthCheckup {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  checkupType: string;
  date: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  notes?: string;
}

export default function MedicalTools() {
  const { userProfile } = useAuth();
  const router = useRouter();

  const [showCheckupModal, setShowCheckupModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [checkupType, setCheckupType] = useState("");
  const [checkupNotes, setCheckupNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"tools" | "schedule" | "history">(
    "tools"
  );

  // Mock data - in real app would come from backend
  const scheduledCheckups: HealthCheckup[] = [
    {
      id: "1",
      studentId: "HS001",
      studentName: "Nguyễn Văn An",
      grade: "10A1",
      checkupType: "Khám sức khỏe định kỳ",
      date: "2024-01-16 08:00",
      status: "scheduled",
    },
    {
      id: "2",
      studentId: "HS002",
      studentName: "Trần Thị Bình",
      grade: "11A2",
      checkupType: "Kiểm tra huyết áp",
      date: "2024-01-16 09:00",
      status: "in_progress",
      notes: "Học sinh có tiền sử huyết áp cao",
    },
    {
      id: "3",
      studentId: "HS003",
      studentName: "Lê Văn Cường",
      grade: "12B1",
      checkupType: "Khám sức khỏe thể thao",
      date: "2024-01-15 14:00",
      status: "completed",
      notes: "Đủ điều kiện tham gia thể thao",
    },
  ];

  const medicalTools: MedicalTool[] = [
    {
      id: "health-check",
      title: "Khám sức khỏe",
      description: "Đăng ký và quản lý lịch khám",
      icon: MedicalIcons.stethoscope,
      color: MedicalColors.primary,
      category: "health_check",
      action: () => setShowCheckupModal(true),
    },
    {
      id: "vital-signs",
      title: "Dấu hiệu sinh tồn",
      description: "Đo huyết áp, nhịp tim, nhiệt độ",
      icon: "🌡️",
      color: MedicalColors.accent,
      category: "vital_signs",
      action: () =>
        Alert.alert(
          "Dấu hiệu sinh tồn",
          "Chức năng đo dấu hiệu sinh tồn sẽ được tích hợp với thiết bị y tế"
        ),
    },
    {
      id: "medication",
      title: "Quản lý thuốc",
      description: "Kê đơn và theo dõi thuốc",
      icon: MedicalIcons.medicine,
      color: MedicalColors.secondary,
      category: "medication",
      action: () =>
        Alert.alert("Quản lý thuốc", "Chức năng quản lý thuốc và kê đơn"),
    },
    {
      id: "emergency",
      title: "Khẩn cấp",
      description: "Xử lý tình huống khẩn cấp",
      icon: MedicalIcons.alert,
      color: MedicalColors.error,
      category: "emergency",
      action: () =>
        Alert.alert(
          "Khẩn cấp",
          "Hotline: 0123-456-789\nĐang kết nối với trung tâm y tế..."
        ),
    },
    {
      id: "vaccination",
      title: "Tiêm chủng",
      description: "Lịch tiêm và quản lý vaccine",
      icon: MedicalIcons.syringe,
      color: MedicalColors.warning,
      category: "health_check",
      action: () => router.push("/(tabs)/Vaccination"),
    },
    {
      id: "records",
      title: "Hồ sơ y tế",
      description: "Xem và cập nhật hồ sơ",
      icon: MedicalIcons.report,
      color: MedicalColors.info,
      category: "health_check",
      action: () => router.push("/(tabs)/EventReport"),
    },
  ];

  const handleScheduleCheckup = () => {
    if (!selectedStudent || !checkupType) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    Alert.alert(
      "Xác nhận",
      `Đăng ký khám sức khỏe:\nHọc sinh: ${selectedStudent}\nLoại khám: ${checkupType}`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng ký",
          onPress: () => {
            Alert.alert("Thành công", "Đã đăng ký lịch khám sức khỏe");
            setShowCheckupModal(false);
            setSelectedStudent("");
            setCheckupType("");
            setCheckupNotes("");
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return MedicalColors.info;
      case "in_progress":
        return MedicalColors.warning;
      case "completed":
        return MedicalColors.success;
      case "cancelled":
        return MedicalColors.error;
      default:
        return MedicalColors.textMuted;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Đã lên lịch";
      case "in_progress":
        return "Đang khám";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  const renderMedicalTool = ({ item }: { item: MedicalTool }) => (
    <TouchableOpacity
      style={[styles.toolCard, { borderLeftColor: item.color }]}
      onPress={item.action}
    >
      <View style={styles.toolContent}>
        <Text style={styles.toolIcon}>{item.icon}</Text>
        <View style={styles.toolInfo}>
          <Text style={styles.toolTitle}>{item.title}</Text>
          <Text style={styles.toolDescription}>{item.description}</Text>
        </View>
      </View>
      <Text style={styles.toolArrow}>→</Text>
    </TouchableOpacity>
  );

  const renderCheckupItem = ({ item }: { item: HealthCheckup }) => (
    <View
      style={[
        styles.checkupCard,
        { borderLeftColor: getStatusColor(item.status) },
      ]}
    >
      <View style={styles.checkupHeader}>
        <Text style={styles.checkupStudent}>{item.studentName}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      <View style={styles.checkupDetails}>
        <Text style={styles.checkupInfo}>Mã HS: {item.studentId}</Text>
        <Text style={styles.checkupInfo}>Lớp: {item.grade}</Text>
        <Text style={styles.checkupInfo}>Loại khám: {item.checkupType}</Text>
        <Text style={styles.checkupInfo}>Thời gian: {item.date}</Text>
        {item.notes && (
          <Text style={styles.checkupNotes}>Ghi chú: {item.notes}</Text>
        )}
      </View>
    </View>
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
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}
    >
      <Text
        style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <CustomHeader
        title="Công cụ Y tế"
        subtitle="Quản lý khám sức khỏe và y tế"
        icon={<Text style={{ fontSize: 14 }}>{MedicalIcons.stethoscope}</Text>}
        showBack={true}
        onBack={() => router.back()}
      />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TabButton
          title="Công cụ"
          isActive={activeTab === "tools"}
          onPress={() => setActiveTab("tools")}
        />
        <TabButton
          title="Lịch khám"
          isActive={activeTab === "schedule"}
          onPress={() => setActiveTab("schedule")}
        />
        <TabButton
          title="Lịch sử"
          isActive={activeTab === "history"}
          onPress={() => setActiveTab("history")}
        />
      </View>

      {/* Content */}
      {activeTab === "tools" && (
        <FlatList
          data={medicalTools}
          renderItem={renderMedicalTool}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.toolsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === "schedule" && (
        <FlatList
          data={scheduledCheckups.filter(
            (c) => c.status === "scheduled" || c.status === "in_progress"
          )}
          renderItem={renderCheckupItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.checkupList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === "history" && (
        <FlatList
          data={scheduledCheckups.filter(
            (c) => c.status === "completed" || c.status === "cancelled"
          )}
          renderItem={renderCheckupItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.checkupList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Schedule Checkup Modal */}
      <Modal
        visible={showCheckupModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCheckupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đăng ký khám sức khỏe</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCheckupModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mã học sinh</Text>
                <TextInput
                  style={styles.input}
                  value={selectedStudent}
                  onChangeText={setSelectedStudent}
                  placeholder="Nhập mã học sinh (VD: HS001)"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Loại khám</Text>
                <TextInput
                  style={styles.input}
                  value={checkupType}
                  onChangeText={setCheckupType}
                  placeholder="Loại khám sức khỏe"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ghi chú (tùy chọn)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={checkupNotes}
                  onChangeText={setCheckupNotes}
                  placeholder="Ghi chú thêm..."
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCheckupModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleScheduleCheckup}
              >
                <Text style={styles.confirmButtonText}>Đăng ký</Text>
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
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerContent: {
    flex: 1,
  },
  headerIcon: {
    fontSize: 24,
    marginBottom: 5,
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: MedicalColors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 5,
  },
  activeTabButton: {
    backgroundColor: MedicalColors.primary + "20",
  },
  tabButtonText: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    fontWeight: "500",
  },
  activeTabButtonText: {
    color: MedicalColors.primary,
    fontWeight: "bold",
  },
  toolsList: {
    padding: 20,
  },
  toolCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toolContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  toolIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 5,
  },
  toolDescription: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
  },
  toolArrow: {
    fontSize: 20,
    color: MedicalColors.textMuted,
  },
  checkupList: {
    padding: 20,
  },
  checkupCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  checkupStudent: {
    fontSize: 16,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  checkupDetails: {
    gap: 5,
  },
  checkupInfo: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
  },
  checkupNotes: {
    fontSize: 14,
    color: MedicalColors.textMuted,
    fontStyle: "italic",
    marginTop: 5,
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
    maxHeight: "80%",
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
    height: 80,
    textAlignVertical: "top",
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
});
