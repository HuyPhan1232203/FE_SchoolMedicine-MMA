import { router, Stack } from "expo-router";
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
import CustomHeader from "../../components/CustomHeader";
import { MedicalColors, MedicalIcons } from "../../constants/Colors";
import { useAuth } from "../../hooks/useAuth";

const { width } = Dimensions.get("window");

export default function SystemConfig() {
  const [schoolInfo, setSchoolInfo] = useState({
    name: "Trường THPT Medical MMA",
    address: "TP. Hồ Chí Minh",
    phone: "028-1234-5678",
    email: "info@school.edu.vn",
    website: "https://school.edu.vn",
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
    testID,
  }: {
    title: string;
    onPress: () => void;
    style?: any;
    icon?: string;
    testID?: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        style,
        {
          borderRadius: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 3,
          elevation: 2,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      testID={testID}
    >
      {icon && <Text style={styles.actionButtonIcon}>{icon}</Text>}
      <Text style={styles.actionButtonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: "" }} />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header */}
        <CustomHeader
          title="Cấu hình hệ thống"
          icon={<Text style={{ fontSize: 14 }}>{MedicalIcons.settings}</Text>}
        />

        {/* School Information */}
        <ConfigSection title="🏫 Thông tin trường học">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            <View style={{ flex: 1, minWidth: (width - 80) / 2 }}>
              <InputField
                label="Tên trường"
                value={schoolInfo.name}
                onChangeText={(text) =>
                  setSchoolInfo((prev) => ({ ...prev, name: text }))
                }
                placeholder="Nhập tên trường"
              />
            </View>
            <View style={{ flex: 1, minWidth: (width - 80) / 2 }}>
              <InputField
                label="Số điện thoại"
                value={schoolInfo.phone}
                onChangeText={(text) =>
                  setSchoolInfo((prev) => ({ ...prev, phone: text }))
                }
                placeholder="Nhập số điện thoại"
              />
            </View>
          </View>
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
          <InputField
            label="Địa chỉ"
            value={schoolInfo.address}
            onChangeText={(text) =>
              setSchoolInfo((prev) => ({ ...prev, address: text }))
            }
            placeholder="Nhập địa chỉ"
            multiline
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
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            <View style={{ flex: 1, minWidth: (width - 80) / 2 }}>
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
            </View>
            <View style={{ flex: 1, minWidth: (width - 80) / 2 }}>
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
            </View>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            <View style={{ flex: 1, minWidth: (width - 80) / 2 }}>
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
            </View>
            <View style={{ flex: 1, minWidth: (width - 80) / 2 }}>
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
            </View>
          </View>
          <ActionButton
            title="Lưu cài đặt thông báo"
            onPress={handleSaveNotificationSettings}
            style={styles.saveButton}
            icon="💾"
          />
        </ConfigSection>

        {/* System Settings */}
        <ConfigSection title="⚙️ Cài đặt hệ thống">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            <View style={{ flex: 1, minWidth: (width - 80) / 2 }}>
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
            </View>
            <View style={{ flex: 1, minWidth: (width - 80) / 2 }}>
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
            </View>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            <View style={{ flex: 1, minWidth: (width - 80) / 2 }}>
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
            </View>
            <View style={{ flex: 1, minWidth: (width - 80) / 2 }}>
              <SwitchField
                label="Chế độ bảo trì"
                value={systemSettings.maintenanceMode}
                onValueChange={(value) =>
                  setSystemSettings((prev) => ({
                    ...prev,
                    maintenanceMode: value,
                  }))
                }
                description="Chỉ admin có thể truy cập hệ thống"
              />
            </View>
          </View>
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

        {/* Data Management & Quick Actions */}
        <ConfigSection title="💾 Quản lý dữ liệu & Thao tác">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
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
            <ActionButton
              title="Import Users"
              onPress={() => router.push("/AdminImport")}
              style={styles.importButton}
              icon="📥"
              testID="import-users-btn"
            />
            <ActionButton
              title="Kiểm tra hệ thống"
              onPress={() =>
                Alert.alert("Thông báo", "Hệ thống đang hoạt động bình thường")
              }
              style={styles.checkButton}
              icon="🔍"
              testID="check-btn"
            />
          </View>
        </ConfigSection>

        {/* Logout Section */}
        <ConfigSection title="🚪 Thoát hệ thống">
          <ActionButton
            title="Đăng xuất"
            onPress={() => {
              Alert.alert(
                "Xác nhận đăng xuất",
                "Bạn có chắc muốn đăng xuất khỏi hệ thống?",
                [
                  { text: "Hủy", style: "cancel" },
                  {
                    text: "Đăng xuất",
                    style: "destructive",
                    onPress: () => router.replace("/Login"),
                  },
                ]
              );
            }}
            style={styles.logoutButton}
            icon="🚪"
            testID="logout-btn"
          />
        </ConfigSection>
      </ScrollView>
    </>
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
    margin: 16,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: MedicalColors.textPrimary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: MedicalColors.borderMedium,
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    backgroundColor: MedicalColors.backgroundSecondary,
  },
  multilineInput: {
    height: 70,
    textAlignVertical: "top",
  },
  switchGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  switchInfo: {
    flex: 1,
    marginRight: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: MedicalColors.textPrimary,
  },
  switchDescription: {
    fontSize: 11,
    color: MedicalColors.textSecondary,
    marginTop: 1,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    flex: 1,
    minWidth: (width - 80) / 2,
  },
  actionButtonIcon: {
    fontSize: 14,
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
  backupButton: {
    backgroundColor: "#9B59B6",
  },
  exportButton: {
    backgroundColor: "#E67E22",
  },
  importButton: {
    backgroundColor: "#2ECC71",
  },
  checkButton: {
    backgroundColor: "#16A085",
  },
  logoutButton: {
    backgroundColor: "#E74C3C",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: MedicalColors.backgroundSecondary,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: MedicalColors.textPrimary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: MedicalColors.backgroundSecondary,
  },
  errorText: {
    fontSize: 18,
    color: MedicalColors.textPrimary,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: MedicalColors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
