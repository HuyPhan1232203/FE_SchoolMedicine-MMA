import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomHeader from "../../components/CustomHeader";
import { MedicalColors, MedicalIcons } from "../../constants/Colors";
import { useAuth } from "../../hooks/useAuth";

const { width } = Dimensions.get("window");

interface ImportTemplate {
  id: string;
  name: string;
  description: string;
  fields: string[];
  example: string;
  icon: string;
}

interface ImportHistory {
  id: string;
  fileName: string;
  type: string;
  records: number;
  success: number;
  failed: number;
  date: string;
  status: "completed" | "processing" | "failed";
}

export default function AdminImport() {
  const { userProfile } = useAuth();
  useEffect(() => {
    if (userProfile && userProfile.role !== "administrator") {
      router.replace("/Login");
    }
  }, [userProfile]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ImportTemplate | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Mock data - would come from backend
  const importTemplates: ImportTemplate[] = [
    {
      id: "1",
      name: "Danh sách học sinh",
      description: "Import danh sách học sinh từ file Excel/CSV",
      fields: [
        "Mã học sinh",
        "Họ tên",
        "Lớp",
        "Ngày sinh",
        "Giới tính",
        "Số điện thoại phụ huynh",
      ],
      example: "HS001,Nguyễn Văn An,10A1,15/03/2008,Nam,0901234567",
      icon: "👨‍🎓",
    },
    {
      id: "2",
      name: "Danh sách phụ huynh",
      description: "Import thông tin phụ huynh và liên kết với học sinh",
      fields: [
        "Email",
        "Họ tên",
        "Số điện thoại",
        "Địa chỉ",
        "Mã học sinh con",
      ],
      example:
        "nguyenvanan@gmail.com,Nguyễn Văn An,0901234567,123 Đường ABC,HS001",
      icon: "👨‍👩‍👧‍👦",
    },
    {
      id: "3",
      name: "Danh sách cán bộ y tế",
      description: "Import thông tin cán bộ y tế nhà trường",
      fields: ["Email", "Họ tên", "Chức vụ", "Số điện thoại", "Chuyên môn"],
      example:
        "bacsilan@school.edu.vn,Nguyễn Thị Lan,Bác sĩ,0912345678,Nhi khoa",
      icon: "👩‍⚕️",
    },
    {
      id: "4",
      name: "Lịch tiêm chủng",
      description: "Import lịch tiêm chủng cho học sinh",
      fields: ["Mã học sinh", "Tên vaccine", "Ngày tiêm", "Liều số", "Ghi chú"],
      example: "HS001,COVID-19,15/01/2024,1,Liều đầu tiên",
      icon: "💉",
    },
    {
      id: "5",
      name: "Hồ sơ sức khỏe",
      description: "Import hồ sơ khám sức khỏe định kỳ",
      fields: [
        "Mã học sinh",
        "Ngày khám",
        "Chiều cao",
        "Cân nặng",
        "Tình trạng sức khỏe",
      ],
      example: "HS001,20/12/2024,165,55,Khỏe mạnh",
      icon: "📋",
    },
  ];

  const importHistory: ImportHistory[] = [
    {
      id: "1",
      fileName: "danh_sach_hoc_sinh_2024.xlsx",
      type: "Danh sách học sinh",
      records: 350,
      success: 348,
      failed: 2,
      date: "15/12/2024 09:30",
      status: "completed",
    },
    {
      id: "2",
      fileName: "phu_huynh_quy_1.csv",
      type: "Danh sách phụ huynh",
      records: 280,
      success: 275,
      failed: 5,
      date: "14/12/2024 14:20",
      status: "completed",
    },
    {
      id: "3",
      fileName: "lich_tiem_chung.xlsx",
      type: "Lịch tiêm chủng",
      records: 150,
      success: 0,
      failed: 150,
      date: "13/12/2024 16:45",
      status: "failed",
    },
    {
      id: "4",
      fileName: "ho_so_suc_khoe.xlsx",
      type: "Hồ sơ sức khỏe",
      records: 200,
      success: 200,
      failed: 0,
      date: "12/12/2024 11:15",
      status: "completed",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return MedicalColors.success;
      case "processing":
        return MedicalColors.warning;
      case "failed":
        return MedicalColors.error;
      default:
        return MedicalColors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "processing":
        return "Đang xử lý";
      case "failed":
        return "Thất bại";
      default:
        return "Không xác định";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "✅";
      case "processing":
        return "⏳";
      case "failed":
        return "❌";
      default:
        return "❓";
    }
  };

  const handleTemplateSelect = (template: ImportTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const handleUpload = () => {
    if (!selectedTemplate) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setShowUploadModal(false);
          setShowTemplateModal(false);
          Alert.alert("Thành công", "File đã được import thành công!");
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const downloadTemplate = (template: ImportTemplate) => {
    Alert.alert("Tải template", `Tải template cho ${template.name}?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Tải xuống",
        onPress: () => {
          Alert.alert("Thành công", "Template đã được tải xuống");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <CustomHeader
        title="Nhập dữ liệu"
        subtitle="Import dữ liệu từ file Excel/CSV"
        icon={<Text style={{ fontSize: 14 }}>{MedicalIcons.import}</Text>}
        showBack={true}
        onBack={() => router.back()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{importHistory.length}</Text>
            <Text style={styles.statLabel}>Lần import</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {importHistory.filter((h) => h.status === "completed").length}
            </Text>
            <Text style={styles.statLabel}>Thành công</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {importHistory.reduce((sum, h) => sum + h.success, 0)}
            </Text>
            <Text style={styles.statLabel}>Bản ghi</Text>
          </View>
        </View>

        {/* Import Templates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Template import</Text>
          <Text style={styles.sectionSubtitle}>
            Chọn loại dữ liệu cần import
          </Text>

          {importTemplates.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={styles.templateCard}
              onPress={() => handleTemplateSelect(template)}
            >
              <View style={styles.templateHeader}>
                <Text style={styles.templateIcon}>{template.icon}</Text>
                <View style={styles.templateInfo}>
                  <Text style={styles.templateName}>{template.name}</Text>
                  <Text style={styles.templateDescription}>
                    {template.description}
                  </Text>
                </View>
                <Text style={styles.templateArrow}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Import History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Lịch sử import</Text>
          <Text style={styles.sectionSubtitle}>Các lần import gần đây</Text>

          {importHistory.map((history) => (
            <View key={history.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyFileName}>{history.fileName}</Text>
                  <Text style={styles.historyType}>{history.type}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(history.status) + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(history.status) },
                    ]}
                  >
                    {getStatusIcon(history.status)}{" "}
                    {getStatusText(history.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.historyDetails}>
                <View style={styles.historyDetail}>
                  <Text style={styles.detailLabel}>Tổng bản ghi:</Text>
                  <Text style={styles.detailValue}>{history.records}</Text>
                </View>
                <View style={styles.historyDetail}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: MedicalColors.success },
                    ]}
                  >
                    Thành công:
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: MedicalColors.success },
                    ]}
                  >
                    {history.success}
                  </Text>
                </View>
                <View style={styles.historyDetail}>
                  <Text
                    style={[styles.detailLabel, { color: MedicalColors.error }]}
                  >
                    Thất bại:
                  </Text>
                  <Text
                    style={[styles.detailValue, { color: MedicalColors.error }]}
                  >
                    {history.failed}
                  </Text>
                </View>
                <View style={styles.historyDetail}>
                  <Text style={styles.detailLabel}>Ngày import:</Text>
                  <Text style={styles.detailValue}>{history.date}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Template Detail Modal */}
      <Modal
        visible={showTemplateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTemplateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết template</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowTemplateModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedTemplate && (
                <>
                  <Text style={styles.detailTitle}>
                    {selectedTemplate.name}
                  </Text>
                  <Text style={styles.detailDescription}>
                    {selectedTemplate.description}
                  </Text>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>
                      Các trường dữ liệu:
                    </Text>
                    {selectedTemplate.fields.map((field, index) => (
                      <Text key={index} style={styles.fieldItem}>
                        • {field}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>
                      Ví dụ dữ liệu:
                    </Text>
                    <View style={styles.exampleContainer}>
                      <Text style={styles.exampleText}>
                        {selectedTemplate.example}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Hướng dẫn:</Text>
                    <Text style={styles.instructionText}>
                      • File phải có định dạng Excel (.xlsx) hoặc CSV (.csv)
                      {"\n"}• Dữ liệu phải được sắp xếp theo thứ tự các trường
                      trên{"\n"}• Không được để trống các trường bắt buộc{"\n"}•
                      Định dạng ngày tháng: DD/MM/YYYY{"\n"}• Email phải đúng
                      định dạng{"\n"}• Số điện thoại chỉ chứa số, không có ký tự
                      đặc biệt
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowTemplateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() =>
                  selectedTemplate && downloadTemplate(selectedTemplate)
                }
              >
                <Text style={styles.downloadButtonText}>Tải template</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  setShowTemplateModal(false);
                  setShowUploadModal(true);
                }}
              >
                <Text style={styles.confirmButtonText}>Import</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload file</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowUploadModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.uploadTitle}>
                Import {selectedTemplate?.name}
              </Text>

              <View style={styles.uploadSection}>
                <Text style={styles.uploadSectionTitle}>Chọn file</Text>
                <TouchableOpacity style={styles.fileSelector}>
                  <Text style={styles.fileSelectorText}>
                    📁 Chọn file Excel/CSV
                  </Text>
                </TouchableOpacity>
              </View>

              {isUploading && (
                <View style={styles.uploadSection}>
                  <Text style={styles.uploadSectionTitle}>
                    Tiến trình upload
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${uploadProgress}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>{uploadProgress}%</Text>
                </View>
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowUploadModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  isUploading && styles.disabledButton,
                ]}
                onPress={handleUpload}
                disabled={isUploading}
              >
                <Text style={styles.confirmButtonText}>
                  {isUploading ? "Đang upload..." : "Upload"}
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
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    marginBottom: 15,
  },
  templateCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  templateHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  templateIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    marginBottom: 2,
  },
  templateDescription: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
  },
  templateArrow: {
    fontSize: 18,
    color: MedicalColors.textSecondary,
  },
  historyCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  historyInfo: {
    flex: 1,
  },
  historyFileName: {
    fontSize: 16,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    marginBottom: 2,
  },
  historyType: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
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
  historyDetails: {
    gap: 5,
  },
  historyDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
  },
  detailValue: {
    fontSize: 12,
    color: MedicalColors.textPrimary,
    fontWeight: "500",
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
  detailTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 10,
  },
  detailDescription: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
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
  fieldItem: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    marginBottom: 5,
    paddingLeft: 10,
  },
  exampleContainer: {
    backgroundColor: MedicalColors.background,
    borderRadius: 8,
    padding: 12,
  },
  exampleText: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
    fontFamily: "monospace",
  },
  instructionText: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: MedicalColors.border,
    gap: 10,
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
  downloadButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: MedicalColors.accent,
    alignItems: "center",
  },
  downloadButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
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
  disabledButton: {
    backgroundColor: MedicalColors.border,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 20,
  },
  uploadSection: {
    marginBottom: 20,
  },
  uploadSectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: MedicalColors.textPrimary,
    marginBottom: 10,
  },
  fileSelector: {
    borderWidth: 2,
    borderColor: MedicalColors.border,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  fileSelectorText: {
    fontSize: 16,
    color: MedicalColors.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: MedicalColors.border,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: MedicalColors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: MedicalColors.textPrimary,
    textAlign: "center",
    fontWeight: "500",
  },
});
