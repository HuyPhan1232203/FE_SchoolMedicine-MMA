import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { MedicalColors, MedicalIcons } from '../constants/Colors';
import {
    generateSampleCSV,
    generateSampleJSON,
    ImportResult,
    ImportUserData,
    importUsers,
    parseCSVData,
    parseJSONData
} from '../services/importService';
import { UserRole } from '../services/userService';

const { width } = Dimensions.get('window');

export default function AdminImport() {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [importData, setImportData] = useState<ImportUserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [sampleType, setSampleType] = useState<'json' | 'csv'>('json');
  const [manualData, setManualData] = useState('');

  const handleFilePicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/csv', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        setSelectedFile(file);
        
        // Read file content (simplified - in real app you'd use file system)
        // For demo, we'll use manual input
        Alert.alert(
          'File đã chọn',
          `Đã chọn file: ${file.name}\n\nVui lòng copy nội dung file và dán vào ô "Dữ liệu thủ công" bên dưới.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn file');
    }
  };

  const parseManualData = () => {
    if (!manualData.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập dữ liệu');
      return;
    }

    setLoading(true);
    try {
      let parsedData: ImportUserData[];
      
      // Try to detect if it's JSON or CSV
      if (manualData.trim().startsWith('[') || manualData.trim().startsWith('{')) {
        // JSON format
        parsedData = parseJSONData(manualData);
      } else {
        // CSV format
        parsedData = parseCSVData(manualData);
      }

      setImportData(parsedData);
      setShowPreview(true);
      Alert.alert('Thành công', `Đã phân tích ${parsedData.length} bản ghi`);
    } catch (error: any) {
      Alert.alert('Lỗi phân tích', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (importData.length === 0) {
      Alert.alert('Lỗi', 'Không có dữ liệu để import');
      return;
    }

    Alert.alert(
      'Xác nhận Import',
      `Bạn có chắc muốn import ${importData.length} user vào hệ thống?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Import',
          onPress: async () => {
            setImporting(true);
            try {
              const result = await importUsers(importData);
              setImportResult(result);
              
              Alert.alert(
                'Kết quả Import',
                `✅ Thành công: ${result.success}\n❌ Thất bại: ${result.failed}\n🔄 Trùng lặp: ${result.duplicates}`,
                [{ text: 'OK' }]
              );
            } catch (error: any) {
              Alert.alert('Lỗi Import', error.message);
            } finally {
              setImporting(false);
            }
          },
        },
      ]
    );
  };

  const showSampleData = (type: 'json' | 'csv') => {
    setSampleType(type);
    setShowSampleModal(true);
  };

  const copySampleData = () => {
    const sampleData = sampleType === 'json' ? generateSampleJSON() : generateSampleCSV();
    setManualData(sampleData);
    setShowSampleModal(false);
    Alert.alert('Đã sao chép', 'Dữ liệu mẫu đã được dán vào ô nhập liệu');
  };

  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case UserRole.PARENT: return 'Phụ huynh';
      case UserRole.MEDICAL_STAFF: return 'Cán bộ Y tế';
      case UserRole.ADMINISTRATOR: return 'Quản trị viên';
      default: return 'Không xác định';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>{MedicalIcons.report}</Text>
        <Text style={styles.title}>Import User Hàng Loạt</Text>
        <Text style={styles.subtitle}>
          Nhập danh sách user từ file JSON hoặc CSV
        </Text>
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Hướng dẫn</Text>
        <View style={styles.instructionCard}>
          <Text style={styles.instructionText}>
            <Text style={styles.bold}>1. Chuẩn bị dữ liệu:</Text> File JSON hoặc CSV với các trường bắt buộc
          </Text>
          <Text style={styles.instructionText}>
            <Text style={styles.bold}>2. Các trường bắt buộc:</Text> email, fullName, phoneNumber, role
          </Text>
          <Text style={styles.instructionText}>
            <Text style={styles.bold}>3. Vai trò hợp lệ:</Text> parent, medical_staff, administrator
          </Text>
          <Text style={styles.instructionText}>
            <Text style={styles.bold}>4. Xem mẫu:</Text> Nhấn nút "Xem mẫu" để tải dữ liệu mẫu
          </Text>
        </View>
      </View>

      {/* Sample Data */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📄 Dữ liệu mẫu</Text>
        <View style={styles.sampleButtons}>
          <TouchableOpacity
            style={[styles.sampleButton, styles.jsonButton]}
            onPress={() => showSampleData('json')}
          >
            <Text style={styles.sampleButtonText}>📄 Xem mẫu JSON</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.sampleButton, styles.csvButton]}
            onPress={() => showSampleData('csv')}
          >
            <Text style={styles.sampleButtonText}>📊 Xem mẫu CSV</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* File Picker */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📁 Chọn file</Text>
        <TouchableOpacity
          style={styles.filePickerButton}
          onPress={handleFilePicker}
        >
          <Text style={styles.filePickerIcon}>📎</Text>
          <Text style={styles.filePickerText}>
            {selectedFile ? selectedFile.name : 'Chọn file JSON/CSV'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Manual Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✏️ Dữ liệu thủ công</Text>
        <Text style={styles.helperText}>
          Paste nội dung file JSON hoặc CSV vào đây:
        </Text>
        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={10}
          value={manualData}
          onChangeText={setManualData}
          placeholder="Paste dữ liệu JSON hoặc CSV vào đây..."
          placeholderTextColor={MedicalColors.textMuted}
        />
        
        <TouchableOpacity
          style={styles.parseButton}
          onPress={parseManualData}
          disabled={loading || !manualData.trim()}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.parseButtonIcon}>🔍</Text>
              <Text style={styles.parseButtonText}>Phân tích dữ liệu</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Preview Data */}
      {importData.length > 0 && (
        <View style={styles.section}>
          <View style={styles.previewHeader}>
            <Text style={styles.sectionTitle}>👁️ Xem trước dữ liệu</Text>
            <Text style={styles.recordCount}>{importData.length} bản ghi</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.tableHeader]}>Email</Text>
                <Text style={[styles.tableCell, styles.tableHeader]}>Họ tên</Text>
                <Text style={[styles.tableCell, styles.tableHeader]}>SĐT</Text>
                <Text style={[styles.tableCell, styles.tableHeader]}>Vai trò</Text>
                <Text style={[styles.tableCell, styles.tableHeader]}>Mã HS</Text>
              </View>
              
              {/* Table Data */}
              {importData.slice(0, 10).map((user, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{user.email}</Text>
                  <Text style={styles.tableCell}>{user.fullName}</Text>
                  <Text style={styles.tableCell}>{user.phoneNumber}</Text>
                  <Text style={styles.tableCell}>{getRoleDisplayName(user.role)}</Text>
                  <Text style={styles.tableCell}>{user.studentId || '-'}</Text>
                </View>
              ))}
              
              {importData.length > 10 && (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.moreText]}>
                    ... và {importData.length - 10} bản ghi khác
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Import Button */}
          <TouchableOpacity
            style={styles.importButton}
            onPress={handleImport}
            disabled={importing}
          >
            {importing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.importButtonIcon}>🚀</Text>
                <Text style={styles.importButtonText}>
                  Import {importData.length} User
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Import Result */}
      {importResult && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Kết quả Import</Text>
          <View style={styles.resultCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>✅ Thành công:</Text>
              <Text style={[styles.resultValue, styles.successText]}>
                {importResult.success}
              </Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>❌ Thất bại:</Text>
              <Text style={[styles.resultValue, styles.errorText]}>
                {importResult.failed}
              </Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>🔄 Trùng lặp:</Text>
              <Text style={[styles.resultValue, styles.warningText]}>
                {importResult.duplicates}
              </Text>
            </View>

            {/* Show Errors */}
            {importResult.errors.length > 0 && (
              <View style={styles.errorsSection}>
                <Text style={styles.errorsTitle}>Chi tiết lỗi:</Text>
                {importResult.errors.slice(0, 5).map((error, index) => (
                  <Text key={index} style={styles.errorItem}>
                    • {error.email}: {error.error}
                  </Text>
                ))}
                {importResult.errors.length > 5 && (
                  <Text style={styles.moreErrors}>
                    ... và {importResult.errors.length - 5} lỗi khác
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      )}

      {/* Sample Data Modal */}
      <Modal
        visible={showSampleModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSampleModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Dữ liệu mẫu {sampleType.toUpperCase()}
            </Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowSampleModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.sampleTextInput}
              multiline
              value={sampleType === 'json' ? generateSampleJSON() : generateSampleCSV()}
              editable={false}
            />
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={copySampleData}
            >
              <Text style={styles.copyButtonText}>📋 Sao chép & Sử dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {MedicalIcons.school} Admin Import Tool v1.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MedicalColors.backgroundSecondary,
  },
  header: {
    backgroundColor: MedicalColors.primary,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: MedicalColors.textPrimary,
    marginBottom: 15,
  },
  instructionCard: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionText: {
    fontSize: 14,
    color: MedicalColors.textPrimary,
    lineHeight: 20,
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
  sampleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  sampleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  jsonButton: {
    backgroundColor: MedicalColors.info,
  },
  csvButton: {
    backgroundColor: MedicalColors.secondary,
  },
  sampleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  filePickerButton: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MedicalColors.border,
    borderStyle: 'dashed',
  },
  filePickerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  filePickerText: {
    fontSize: 16,
    color: MedicalColors.textPrimary,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: MedicalColors.textPrimary,
    borderWidth: 2,
    borderColor: MedicalColors.border,
    textAlignVertical: 'top',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  parseButton: {
    backgroundColor: MedicalColors.accent,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  parseButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  parseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  recordCount: {
    fontSize: 14,
    color: MedicalColors.textMuted,
    backgroundColor: MedicalColors.backgroundCard,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  table: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: MedicalColors.border,
  },
  tableCell: {
    width: 120,
    padding: 12,
    fontSize: 12,
    color: MedicalColors.textPrimary,
  },
  tableHeader: {
    backgroundColor: MedicalColors.backgroundSecondary,
    fontWeight: 'bold',
    color: MedicalColors.textPrimary,
  },
  moreText: {
    fontStyle: 'italic',
    color: MedicalColors.textMuted,
    textAlign: 'center',
    width: 600,
  },
  importButton: {
    backgroundColor: MedicalColors.success,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: MedicalColors.shadowMedium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  importButtonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  importButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 16,
    color: MedicalColors.textPrimary,
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  successText: {
    color: MedicalColors.success,
  },
  errorText: {
    color: MedicalColors.error,
  },
  warningText: {
    color: MedicalColors.warning,
  },
  errorsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: MedicalColors.border,
  },
  errorsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: MedicalColors.textPrimary,
    marginBottom: 8,
  },
  errorItem: {
    fontSize: 12,
    color: MedicalColors.error,
    marginBottom: 4,
    lineHeight: 16,
  },
  moreErrors: {
    fontSize: 12,
    color: MedicalColors.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: MedicalColors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: MedicalColors.primary,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  sampleTextInput: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    fontSize: 12,
    color: MedicalColors.textPrimary,
    fontFamily: 'monospace',
    textAlignVertical: 'top',
    minHeight: 400,
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: MedicalColors.border,
  },
  copyButton: {
    backgroundColor: MedicalColors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    fontSize: 12,
    color: MedicalColors.textMuted,
  },
}); 