import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
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

interface VaccinationRecord {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  vaccineName: string;
  doseNumber: number;
  scheduledDate: string;
  actualDate?: string;
  status: "scheduled" | "completed" | "missed" | "cancelled";
  notes?: string;
  batchNumber?: string;
  givenBy?: string;
}

interface VaccineSchedule {
  id: string;
  vaccineName: string;
  description: string;
  targetGrade: string;
  scheduledDate: string;
  totalStudents: number;
  completedCount: number;
  status: "upcoming" | "in_progress" | "completed";
}

export default function Vaccination() {
  const { userProfile } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "schedule" | "records" | "calendar"
  >("schedule");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedVaccine, setSelectedVaccine] = useState("");
  const [doseNumber, setDoseNumber] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [notes, setNotes] = useState("");

  // Mock data - in real app would come from backend
  const vaccinationRecords: VaccinationRecord[] = [
    {
      id: "1",
      studentId: "HS001",
      studentName: "Nguyễn Văn An",
      grade: "10A1",
      vaccineName: "COVID-19",
      doseNumber: 1,
      scheduledDate: "2024-01-15",
      actualDate: "2024-01-15",
      status: "completed",
      batchNumber: "COV-2024-001",
      givenBy: "Y tá Nguyễn Thị A",
    },
    {
      id: "2",
      studentId: "HS002",
      studentName: "Trần Thị Bình",
      grade: "11A2",
      vaccineName: "Cúm mùa",
      doseNumber: 1,
      scheduledDate: "2024-01-20",
      status: "scheduled",
    },
    {
      id: "3",
      studentId: "HS003",
      studentName: "Lê Văn Cường",
      grade: "12B1",
      vaccineName: "Viêm gan B",
      doseNumber: 2,
      scheduledDate: "2024-01-10",
      actualDate: "2024-01-10",
      status: "completed",
      batchNumber: "VGB-2024-002",
      givenBy: "Y tá Trần Văn B",
    },
  ];

  const vaccineSchedules: VaccineSchedule[] = [
    {
      id: "1",
      vaccineName: "COVID-19 - Mũi 1",
      description: "Vaccine phòng COVID-19 cho học sinh lớp 10",
      targetGrade: "10",
      scheduledDate: "2024-01-25",
      totalStudents: 150,
      completedCount: 120,
      status: "in_progress",
    },
    {
      id: "2",
      vaccineName: "Cúm mùa",
      description: "Vaccine phòng cúm mùa cho toàn trường",
      targetGrade: "Tất cả",
      scheduledDate: "2024-02-01",
      totalStudents: 500,
      completedCount: 0,
      status: "upcoming",
    },
    {
      id: "3",
      vaccineName: "Viêm gan B - Mũi 2",
      description: "Vaccine viêm gan B mũi 2 cho học sinh lớp 12",
      targetGrade: "12",
      scheduledDate: "2024-01-15",
      totalStudents: 100,
      completedCount: 95,
      status: "completed",
    },
  ];

  const availableVaccines = [
    "COVID-19",
    "Cúm mùa",
    "Viêm gan B",
    "Sởi - Quai bị - Rubella",
    "Bạch hầu - Ho gà - Uốn ván",
    "Thủy đậu",
  ];

  const handleAddVaccination = () => {
    if (!selectedStudent || !selectedVaccine || !doseNumber || !scheduledDate) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    Alert.alert(
      "Xác nhận",
      `Thêm lịch tiêm chủng:\nHọc sinh: ${selectedStudent}\nVaccine: ${selectedVaccine}\nMũi: ${doseNumber}\nNgày: ${scheduledDate}`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Thêm",
          onPress: () => {
            Alert.alert("Thành công", "Đã thêm lịch tiêm chủng");
            setShowAddModal(false);
            setSelectedStudent("");
            setSelectedVaccine("");
            setDoseNumber("");
            setScheduledDate("");
            setNotes("");
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return MedicalColors.info;
      case "completed":
        return MedicalColors.success;
      case "missed":
        return MedicalColors.error;
      case "cancelled":
        return MedicalColors.textMuted;
      case "upcoming":
        return MedicalColors.info;
      case "in_progress":
        return MedicalColors.warning;
      default:
        return MedicalColors.textMuted;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Đã lên lịch";
      case "completed":
        return "Đã tiêm";
      case "missed":
        return "Bỏ lỡ";
      case "cancelled":
        return "Đã hủy";
      case "upcoming":
        return "Sắp tới";
      case "in_progress":
        return "Đang tiến hành";
      default:
        return "Không xác định";
    }
  };

  const renderVaccinationRecord = ({ item }: { item: VaccinationRecord }) => (
    <View
      style={[
        styles.recordCard,
        { borderLeftColor: getStatusColor(item.status) },
      ]}
    >
      <View style={styles.recordHeader}>
        <Text style={styles.recordStudent}>{item.studentName}</Text>
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
      <View style={styles.recordDetails}>
        <Text style={styles.recordInfo}>Mã HS: {item.studentId}</Text>
        <Text style={styles.recordInfo}>Lớp: {item.grade}</Text>
        <Text style={styles.recordInfo}>Vaccine: {item.vaccineName}</Text>
        <Text style={styles.recordInfo}>Mũi: {item.doseNumber}</Text>
        <Text style={styles.recordInfo}>
          Ngày dự kiến: {item.scheduledDate}
        </Text>
        {item.actualDate && (
          <Text style={styles.recordInfo}>Ngày tiêm: {item.actualDate}</Text>
        )}
        {item.givenBy && (
          <Text style={styles.recordInfo}>Người tiêm: {item.givenBy}</Text>
        )}
        {item.batchNumber && (
          <Text style={styles.recordInfo}>Số lô: {item.batchNumber}</Text>
        )}
        {item.notes && (
          <Text style={styles.recordNotes}>Ghi chú: {item.notes}</Text>
        )}
      </View>
    </View>
  );

  const renderVaccineSchedule = ({ item }: { item: VaccineSchedule }) => {
    const progressPercentage = (item.completedCount / item.totalStudents) * 100;

    return (
      <View
        style={[
          styles.scheduleCard,
          { borderLeftColor: getStatusColor(item.status) },
        ]}
      >
        <View style={styles.scheduleHeader}>
          <Text style={styles.scheduleTitle}>{item.vaccineName}</Text>
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
        <Text style={styles.scheduleDescription}>{item.description}</Text>
        <View style={styles.scheduleInfo}>
          <Text style={styles.scheduleInfoText}>Lớp: {item.targetGrade}</Text>
          <Text style={styles.scheduleInfoText}>
            Ngày: {item.scheduledDate}
          </Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {item.completedCount}/{item.totalStudents} học sinh
            </Text>
            <Text style={styles.progressPercentage}>
              {Math.round(progressPercentage)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercentage}%`,
                  backgroundColor: getStatusColor(item.status),
                },
              ]}
            />
          </View>
        </View>
      </View>
    );
  };

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
        title="Quản lý Tiêm chủng"
        subtitle="Lịch tiêm và hồ sơ vaccine"
        icon={<Text style={{ fontSize: 14 }}>{MedicalIcons.syringe}</Text>}
        showBack={true}
        onBack={() => router.back()}
      />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TabButton
          title="Lịch tiêm"
          isActive={activeTab === "schedule"}
          onPress={() => setActiveTab("schedule")}
        />
        <TabButton
          title="Hồ sơ"
          isActive={activeTab === "records"}
          onPress={() => setActiveTab("records")}
        />
        <TabButton
          title="Lịch"
          isActive={activeTab === "calendar"}
          onPress={() => setActiveTab("calendar")}
        />
      </View>

      {/* Content */}
      {activeTab === "schedule" && (
        <FlatList
          data={vaccineSchedules}
          renderItem={renderVaccineSchedule}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.scheduleList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === "records" && (
        <FlatList
          data={vaccinationRecords}
          renderItem={renderVaccinationRecord}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.recordsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === "calendar" && (
        <View style={styles.calendarContainer}>
          <Text style={styles.calendarTitle}>
            📅 Lịch tiêm chủng tháng 1/2024
          </Text>
          <View style={styles.calendarContent}>
            <View style={styles.calendarDay}>
              <Text style={styles.calendarDate}>15</Text>
              <Text style={styles.calendarEvent}>COVID-19 - Lớp 10</Text>
              <Text style={styles.calendarStatus}>Hoàn thành</Text>
            </View>
            <View style={styles.calendarDay}>
              <Text style={styles.calendarDate}>20</Text>
              <Text style={styles.calendarEvent}>Cúm mùa - Toàn trường</Text>
              <Text style={styles.calendarStatus}>Sắp tới</Text>
            </View>
            <View style={styles.calendarDay}>
              <Text style={styles.calendarDate}>25</Text>
              <Text style={styles.calendarEvent}>COVID-19 - Mũi 2</Text>
              <Text style={styles.calendarStatus}>Đang tiến hành</Text>
            </View>
          </View>
        </View>
      )}

      {/* Add Vaccination Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm lịch tiêm chủng</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAddModal(false)}
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
                <Text style={styles.inputLabel}>Loại vaccine</Text>
                <ScrollView style={styles.vaccineList}>
                  {availableVaccines.map((vaccine) => (
                    <TouchableOpacity
                      key={vaccine}
                      style={[
                        styles.vaccineOption,
                        selectedVaccine === vaccine && styles.selectedVaccine,
                      ]}
                      onPress={() => setSelectedVaccine(vaccine)}
                    >
                      <Text
                        style={[
                          styles.vaccineOptionText,
                          selectedVaccine === vaccine &&
                            styles.selectedVaccineText,
                        ]}
                      >
                        {vaccine}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mũi tiêm</Text>
                <TextInput
                  style={styles.input}
                  value={doseNumber}
                  onChangeText={setDoseNumber}
                  placeholder="Số mũi (VD: 1, 2, 3)"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ngày dự kiến</Text>
                <TextInput
                  style={styles.input}
                  value={scheduledDate}
                  onChangeText={setScheduledDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ghi chú (tùy chọn)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Ghi chú thêm..."
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleAddVaccination}
              >
                <Text style={styles.confirmButtonText}>Thêm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MedicalColors.background,
  },
  header: {
    backgroundColor: MedicalColors.accent,
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
    backgroundColor: MedicalColors.accent + "20",
  },
  tabButtonText: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    fontWeight: "500",
  },
  activeTabButtonText: {
    color: MedicalColors.accent,
    fontWeight: "bold",
  },
  scheduleList: {
    padding: 20,
  },
  scheduleCard: {
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
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    flex: 1,
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
  scheduleDescription: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    marginBottom: 10,
  },
  scheduleInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  scheduleInfoText: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
  },
  progressContainer: {
    marginTop: 5,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  progressText: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
  },
  progressBar: {
    height: 6,
    backgroundColor: MedicalColors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  recordsList: {
    padding: 20,
  },
  recordCard: {
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
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  recordStudent: {
    fontSize: 16,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
  },
  recordDetails: {
    gap: 5,
  },
  recordInfo: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
  },
  recordNotes: {
    fontSize: 14,
    color: MedicalColors.textMuted,
    fontStyle: "italic",
    marginTop: 5,
  },
  calendarContainer: {
    flex: 1,
    padding: 20,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 20,
    textAlign: "center",
  },
  calendarContent: {
    gap: 15,
  },
  calendarDay: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarDate: {
    fontSize: 20,
    fontWeight: "bold",
    color: MedicalColors.accent,
    marginBottom: 5,
  },
  calendarEvent: {
    fontSize: 16,
    fontWeight: "500",
    color: MedicalColors.textPrimary,
    marginBottom: 5,
  },
  calendarStatus: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
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
  vaccineList: {
    maxHeight: 120,
  },
  vaccineOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MedicalColors.border,
    marginBottom: 8,
  },
  selectedVaccine: {
    backgroundColor: MedicalColors.accent + "20",
    borderColor: MedicalColors.accent,
  },
  vaccineOptionText: {
    fontSize: 16,
    color: MedicalColors.textPrimary,
  },
  selectedVaccineText: {
    color: MedicalColors.accent,
    fontWeight: "500",
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
    backgroundColor: MedicalColors.accent,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: MedicalColors.accent,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: MedicalColors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
});
