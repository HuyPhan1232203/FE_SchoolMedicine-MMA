import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import {
  ImportHistory,
  ImportTemplate,
  getImportHistory,
  getImportTemplates,
  initializeImportHistory,
  processCSVData,
} from "../../services/importService";

const { width } = Dimensions.get("window");

export default function AdminImport() {
  const { userProfile } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ImportTemplate | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [importTemplates, setImportTemplates] = useState<ImportTemplate[]>([]);
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([]);

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

  // Reset admin import state when user changes
  useEffect(() => {
    if (userProfile) {
      loadData();
    }
  }, [userProfile?.uid]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [templates, history] = await Promise.all([
        Promise.resolve(getImportTemplates()),
        getImportHistory(),
      ]);

      setImportTemplates(templates);
      setImportHistory(history);
    } catch (error) {
      console.error("Error loading import data:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu import");
    } finally {
      setLoading(false);
    }
  };

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

  const handleTemplateSelect = (template: ImportTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const handleUpload = async () => {
    if (!selectedTemplate || !userProfile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate file processing
      const sampleCSV = selectedTemplate.example;

      // Process the CSV data
      const result = await processCSVData(
        sampleCSV,
        selectedTemplate,
        userProfile.fullName
      );

      if (result.success) {
        Alert.alert("Thành công", result.message);
      } else {
        Alert.alert("Hoàn thành", result.message);
      }

      setShowUploadModal(false);
      setShowTemplateModal(false);
      loadData(); // Reload data
    } catch (error) {
      console.error("Error uploading file:", error);
      Alert.alert("Lỗi", "Không thể xử lý file");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleInitializeData = async () => {
    if (!userProfile) return;

    Alert.alert(
      "Khởi tạo dữ liệu",
      "Bạn có muốn tạo dữ liệu mẫu cho lịch sử import?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Khởi tạo",
          onPress: async () => {
            try {
              await initializeImportHistory(userProfile.fullName);
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={MedicalColors.primary} />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : (
          <>
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
                      <Text style={styles.historyFileName}>
                        {history.fileName}
                      </Text>
                      <Text style={styles.historyType}>{history.type}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            getStatusColor(history.status) + "20",
                        },
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
                        style={[
                          styles.detailLabel,
                          { color: MedicalColors.error },
                        ]}
                      >
                        Thất bại:
                      </Text>
                      <Text
                        style={[
                          styles.detailValue,
                          { color: MedicalColors.error },
                        ]}
                      >
                        {history.failed}
                      </Text>
                    </View>
                    <View style={styles.historyDetail}>
                      <Text style={styles.detailLabel}>Ngày import:</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(history.date)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: MedicalColors.textSecondary,
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
