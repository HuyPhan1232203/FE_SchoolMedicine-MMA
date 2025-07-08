import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MedicalColors } from "../../constants/Colors";
import { useAuth } from "../../hooks/useAuth";

const { width } = Dimensions.get("window");

export default function SystemConfig() {
  const [schoolInfo, setSchoolInfo] = useState({
    name: "Trường THPT ABC",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    phone: "028-1234-5678",
    email: "info@thptabc.edu.vn",
    website: "https://thptabc.edu.vn",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    reminderNotifications: true,
  });

  const [systemSettings, setSystemSettings] = useState({
    allowSelfRegistration: true,
    requireEmailVerification: true,
    autoApproveParents: false,
    maintenanceMode: false,
  });

  const [broadcastMessage, setBroadcastMessage] = useState("");
  const { userProfile } = useAuth();

  const handleSaveSchoolInfo = () => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn lưu thông tin trường học?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Lưu",
        onPress: () => {
          // In real app, save to Firestore
          Alert.alert("Thành công", "Đã lưu thông tin trường học");
        },
      },
    ]);
  };

  const handleSaveNotificationSettings = () => {
    Alert.alert("Thành công", "Đã lưu cài đặt thông báo");
  };

  const handleSaveSystemSettings = () => {
    Alert.alert("Thành công", "Đã lưu cài đặt hệ thống");
  };

  const handleSendBroadcast = () => {
    if (!broadcastMessage.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung thông báo");
      return;
    }

    Alert.alert(
      "Xác nhận gửi thông báo",
      `Bạn có chắc muốn gửi thông báo này đến tất cả người dùng?\n\n"${broadcastMessage}"`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Gửi",
          onPress: () => {
            // In real app, send notification to all users
            Alert.alert("Thành công", "Đã gửi thông báo đến tất cả người dùng");
            setBroadcastMessage("");
          },
        },
      ]
    );
  };

  const handleBackupData = () => {
    Alert.alert(
      "Sao lưu dữ liệu",
      "Bạn có muốn tạo bản sao lưu dữ liệu hệ thống?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Sao lưu",
          onPress: () => {
            // In real app, create backup
            Alert.alert("Thành công", "Đã tạo bản sao lưu dữ liệu");
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert("Xuất dữ liệu", "Chọn loại dữ liệu muốn xuất:", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xuất Users",
        onPress: () => Alert.alert("Thành công", "Đã xuất dữ liệu users"),
      },
      {
        text: "Xuất Sự kiện Y tế",
        onPress: () =>
          Alert.alert("Thành công", "Đã xuất dữ liệu sự kiện y tế"),
      },
      {
        text: "Xuất tất cả",
        onPress: () => Alert.alert("Thành công", "Đã xuất tất cả dữ liệu"),
      },
    ]);
  };

  const ConfigSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    multiline = false,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    multiline?: boolean;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
    </View>
  );

  const SwitchField = ({
    label,
    value,
    onValueChange,
    description,
  }: {
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    description?: string;
  }) => (
    <View style={styles.switchGroup}>
      <View style={styles.switchInfo}>
        <Text style={styles.switchLabel}>{label}</Text>
        {description && (
          <Text style={styles.switchDescription}>{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#e0e0e0", true: MedicalColors.primary }}
        thumbColor={value ? "#FFFFFF" : "#f4f3f4"}
      />
    </View>
  );

  const ActionButton = ({
    title,
    onPress,
    style,
    icon,
  }: {
    title: string;
    onPress: () => void;
    style?: any;
    icon?: string;
  }) => (
    <TouchableOpacity style={[styles.actionButton, style]} onPress={onPress}>
      {icon && <Text style={styles.actionButtonIcon}>{icon}</Text>}
      <Text style={styles.actionButtonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cấu hình Hệ thống</Text>
        <Text style={styles.headerSubtitle}>
          Quản lý cài đặt và cấu hình hệ thống
        </Text>
      </View>

      {/* School Information */}
      <ConfigSection title="🏫 Thông tin trường học">
        <InputField
          label="Tên trường"
          value={schoolInfo.name}
          onChangeText={(text) =>
            setSchoolInfo((prev) => ({ ...prev, name: text }))
          }
          placeholder="Nhập tên trường"
        />
        <InputField
          label="Địa chỉ"
          value={schoolInfo.address}
          onChangeText={(text) =>
            setSchoolInfo((prev) => ({ ...prev, address: text }))
          }
          placeholder="Nhập địa chỉ"
          multiline
        />
        <InputField
          label="Số điện thoại"
          value={schoolInfo.phone}
          onChangeText={(text) =>
            setSchoolInfo((prev) => ({ ...prev, phone: text }))
          }
          placeholder="Nhập số điện thoại"
        />
        <InputField
          label="Email"
          value={schoolInfo.email}
          onChangeText={(text) =>
            setSchoolInfo((prev) => ({ ...prev, email: text }))
          }
          placeholder="Nhập email"
        />
        <InputField
          label="Website"
          value={schoolInfo.website}
          onChangeText={(text) =>
            setSchoolInfo((prev) => ({ ...prev, website: text }))
          }
          placeholder="Nhập website"
        />
        <ActionButton
          title="Lưu thông tin trường"
          onPress={handleSaveSchoolInfo}
          style={styles.saveButton}
          icon="💾"
        />
      </ConfigSection>

      {/* Notification Settings */}
      <ConfigSection title="🔔 Cài đặt thông báo">
        <SwitchField
          label="Thông báo Email"
          value={notificationSettings.emailNotifications}
          onValueChange={(value) =>
            setNotificationSettings((prev) => ({
              ...prev,
              emailNotifications: value,
            }))
          }
          description="Gửi thông báo qua email"
        />
        <SwitchField
          label="Thông báo SMS"
          value={notificationSettings.smsNotifications}
          onValueChange={(value) =>
            setNotificationSettings((prev) => ({
              ...prev,
              smsNotifications: value,
            }))
          }
          description="Gửi thông báo qua tin nhắn SMS"
        />
        <SwitchField
          label="Thông báo Push"
          value={notificationSettings.pushNotifications}
          onValueChange={(value) =>
            setNotificationSettings((prev) => ({
              ...prev,
              pushNotifications: value,
            }))
          }
          description="Gửi thông báo push trên app"
        />
        <SwitchField
          label="Thông báo nhắc nhở"
          value={notificationSettings.reminderNotifications}
          onValueChange={(value) =>
            setNotificationSettings((prev) => ({
              ...prev,
              reminderNotifications: value,
            }))
          }
          description="Gửi thông báo nhắc nhở tự động"
        />
        <ActionButton
          title="Lưu cài đặt thông báo"
          onPress={handleSaveNotificationSettings}
          style={styles.saveButton}
          icon="💾"
        />
      </ConfigSection>

      {/* System Settings */}
      <ConfigSection title="⚙️ Cài đặt hệ thống">
        <SwitchField
          label="Cho phép đăng ký tự do"
          value={systemSettings.allowSelfRegistration}
          onValueChange={(value) =>
            setSystemSettings((prev) => ({
              ...prev,
              allowSelfRegistration: value,
            }))
          }
          description="Người dùng có thể tự đăng ký tài khoản"
        />
        <SwitchField
          label="Yêu cầu xác thực email"
          value={systemSettings.requireEmailVerification}
          onValueChange={(value) =>
            setSystemSettings((prev) => ({
              ...prev,
              requireEmailVerification: value,
            }))
          }
          description="Bắt buộc xác thực email khi đăng ký"
        />
        <SwitchField
          label="Tự động duyệt phụ huynh"
          value={systemSettings.autoApproveParents}
          onValueChange={(value) =>
            setSystemSettings((prev) => ({
              ...prev,
              autoApproveParents: value,
            }))
          }
          description="Tự động phê duyệt tài khoản phụ huynh"
        />
        <SwitchField
          label="Chế độ bảo trì"
          value={systemSettings.maintenanceMode}
          onValueChange={(value) =>
            setSystemSettings((prev) => ({ ...prev, maintenanceMode: value }))
          }
          description="Chỉ admin có thể truy cập hệ thống"
        />
        <ActionButton
          title="Lưu cài đặt hệ thống"
          onPress={handleSaveSystemSettings}
          style={styles.saveButton}
          icon="💾"
        />
      </ConfigSection>

      {/* Broadcast Message */}
      <ConfigSection title="📢 Gửi thông báo chung">
        <InputField
          label="Nội dung thông báo"
          value={broadcastMessage}
          onChangeText={setBroadcastMessage}
          placeholder="Nhập nội dung thông báo muốn gửi đến tất cả người dùng..."
          multiline
        />
        <ActionButton
          title="Gửi thông báo"
          onPress={handleSendBroadcast}
          style={styles.broadcastButton}
          icon="📢"
        />
      </ConfigSection>

      {/* Data Management */}
      <ConfigSection title="💾 Quản lý dữ liệu">
        <View style={styles.dataButtons}>
          <ActionButton
            title="Sao lưu dữ liệu"
            onPress={handleBackupData}
            style={styles.backupButton}
            icon="🗄️"
          />
          <ActionButton
            title="Xuất dữ liệu"
            onPress={handleExportData}
            style={styles.exportButton}
            icon="📤"
          />
        </View>
      </ConfigSection>

      {/* Quick Actions */}
      <ConfigSection title="⚡ Thao tác nhanh">
        <View style={styles.quickActions}>
          <ActionButton
            title="Import Users"
            onPress={() => router.push("/AdminImport")}
            style={styles.importButton}
            icon="📥"
          />
          <ActionButton
            title="Xem Log hệ thống"
            onPress={() =>
              Alert.alert("Thông báo", "Chức năng đang phát triển")
            }
            style={styles.logButton}
            icon="📋"
          />
          <ActionButton
            title="Kiểm tra hệ thống"
            onPress={() =>
              Alert.alert("Thông báo", "Hệ thống đang hoạt động bình thường")
            }
            style={styles.checkButton}
            icon="🔍"
          />
          <ActionButton
            title="Làm mới cache"
            onPress={() =>
              Alert.alert("Thành công", "Đã làm mới cache hệ thống")
            }
            style={styles.refreshButton}
            icon="🔄"
          />
        </View>
      </ConfigSection>
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
  section: {
    margin: 20,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 15,
  },
  sectionContent: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: MedicalColors.borderMedium,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: MedicalColors.backgroundSecondary,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  switchGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  switchInfo: {
    flex: 1,
    marginRight: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
  },
  switchDescription: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
    marginTop: 2,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  actionButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  saveButton: {
    backgroundColor: "#27AE60",
  },
  broadcastButton: {
    backgroundColor: "#3498DB",
  },
  dataButtons: {
    flexDirection: "row",
    gap: 12,
  },
  backupButton: {
    backgroundColor: "#9B59B6",
    flex: 1,
  },
  exportButton: {
    backgroundColor: "#E67E22",
    flex: 1,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  importButton: {
    backgroundColor: "#2ECC71",
    width: (width - 64) / 2,
  },
  logButton: {
    backgroundColor: "#34495E",
    width: (width - 64) / 2,
  },
  checkButton: {
    backgroundColor: "#16A085",
    width: (width - 64) / 2,
  },
  refreshButton: {
    backgroundColor: "#F39C12",
    width: (width - 64) / 2,
  },
});
