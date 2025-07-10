import * as FileSystem from "expo-file-system";
import { router, Stack } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
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
import { db } from "../../lib/firebase";

const { width } = Dimensions.get("window");

// Helper function to get role display name
const getRoleDisplayName = (role: string) => {
  switch (role) {
    case "administrator":
      return "Quản trị viên";
    case "director":
      return "Giám đốc";
    case "manager":
      return "Quản lý";
    default:
      return role;
  }
};

const exportCollectionToCSV = async (
  collectionName: string,
  filename: string
) => {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    if (snapshot.empty) throw new Error("Không có dữ liệu để xuất");
    const docs = snapshot.docs.map((doc) => doc.data());
    const keys = Object.keys(docs[0]);
    const csvRows = [keys.join(",")];
    docs.forEach((obj) => {
      const row = keys.map((k) => JSON.stringify(obj[k] ?? "")).join(",");
      csvRows.push(row);
    });
    const csv = csvRows.join("\n");
    const fileUri = FileSystem.cacheDirectory + filename;
    await FileSystem.writeAsStringAsync(fileUri, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    Alert.alert("Xuất dữ liệu", "Đã xuất file CSV: " + fileUri);
  } catch (error) {
    Alert.alert("Lỗi", "Không thể xuất dữ liệu: " + (error as any).message);
  }
};

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
  const [schoolDirty, setSchoolDirty] = useState(false);
  const [notificationDirty, setNotificationDirty] = useState(false);
  const [systemDirty, setSystemDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const { userProfile, signOut } = useAuth();

  // Firestore: load config
  const loadSystemConfig = async () => {
    try {
      const configRef = doc(db, "config", "systemConfig");
      const configSnap = await getDoc(configRef);
      if (configSnap.exists()) {
        const data = configSnap.data();
        setSchoolInfo(data.schoolInfo || schoolInfo);
        setNotificationSettings(
          data.notificationSettings || notificationSettings
        );
        setSystemSettings(data.systemSettings || systemSettings);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải cấu hình hệ thống");
    }
  };

  useEffect(() => {
    loadSystemConfig();
  }, []);

  // Reset system config state when user changes
  useEffect(() => {
    if (userProfile) {
      loadSystemConfig();
    }
  }, [userProfile?.uid]);

  // Firestore: save school info
  const handleSaveSchoolInfo = async () => {
    setSaving(true);
    try {
      const configRef = doc(db, "config", "systemConfig");
      await setDoc(configRef, { schoolInfo }, { merge: true });
      setSchoolDirty(false);
      setSuccessMsg("Đã lưu thông tin trường học");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lưu thông tin trường học");
    } finally {
      setSaving(false);
    }
  };

  // Firestore: save notification settings
  const handleSaveNotificationSettings = async () => {
    setSaving(true);
    try {
      const configRef = doc(db, "config", "systemConfig");
      await setDoc(configRef, { notificationSettings }, { merge: true });
      setNotificationDirty(false);
      setSuccessMsg("Đã lưu cài đặt thông báo");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lưu cài đặt thông báo");
    } finally {
      setSaving(false);
    }
  };

  // Firestore: save system settings
  const handleSaveSystemSettings = async () => {
    setSaving(true);
    try {
      const configRef = doc(db, "config", "systemConfig");
      await setDoc(configRef, { systemSettings }, { merge: true });
      setSystemDirty(false);
      setSuccessMsg("Đã lưu cài đặt hệ thống");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lưu cài đặt hệ thống");
    } finally {
      setSaving(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastMessage.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung thông báo");
      return;
    }
    try {
      await addDoc(collection(db, "broadcasts"), {
        message: broadcastMessage,
        createdAt: Timestamp.now(),
        createdBy: userProfile?.uid || null,
        createdByName: userProfile?.fullName || null,
      });
      Alert.alert("Thành công", "Đã gửi thông báo đến tất cả người dùng");
      setBroadcastMessage("");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi thông báo. Vui lòng thử lại.");
    }
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
        onPress: () => exportCollectionToCSV("users", "users.csv"),
      },
      {
        text: "Xuất Sự kiện Y tế",
        onPress: () =>
          exportCollectionToCSV("medicalEvents", "medical_events.csv"),
      },
      {
        text: "Xuất tất cả",
        onPress: async () => {
          await exportCollectionToCSV("users", "users.csv");
          await exportCollectionToCSV("medicalEvents", "medical_events.csv");
        },
      },
    ]);
  };

  const handleSystemHealthCheck = async () => {
    let results: string[] = [];

    // 1. Kiểm tra đọc cấu hình
    try {
      const configRef = doc(db, "config", "systemConfig");
      await getDoc(configRef);
      results.push("✅ Đọc cấu hình Firestore: OK");
    } catch {
      results.push("❌ Đọc cấu hình Firestore: LỖI");
    }

    // 2. Kiểm tra quyền ghi Firestore
    try {
      const testRef = doc(db, "config", "healthCheckTest");
      await setDoc(testRef, { test: true, time: Date.now() });
      results.push("✅ Ghi Firestore: OK");
    } catch {
      results.push("❌ Ghi Firestore: LỖI");
    }

    // 3. Kiểm tra đọc users
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      results.push(`✅ Đọc users: OK (${usersSnap.size} bản ghi)`);
    } catch {
      results.push("❌ Đọc users: LỖI");
    }

    // 4. Kiểm tra đọc medicalEvents
    try {
      const eventsSnap = await getDocs(collection(db, "medicalEvents"));
      results.push(`✅ Đọc medicalEvents: OK (${eventsSnap.size} bản ghi)`);
    } catch {
      results.push("❌ Đọc medicalEvents: LỖI");
    }

    Alert.alert("Kiểm tra hệ thống", results.join("\n"));
  };

  const ConfigSection = ({
    title,
    children,
  }: {
    title: React.ReactNode;
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
    onDirty,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    multiline?: boolean;
    onDirty?: () => void;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          onDirty?.();
        }}
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
    onDirty,
  }: {
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    description?: string;
    onDirty?: () => void;
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
        onValueChange={(val) => {
          onValueChange(val);
          onDirty?.();
        }}
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
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header */}
        <CustomHeader
          title="Cấu hình hệ thống"
          icon={<Text style={{ fontSize: 14 }}>{MedicalIcons.settings}</Text>}
        />
        {successMsg ? (
          <View style={styles.successMsg}>
            <Text style={{ fontSize: 14, color: "#27AE60" }}>✓</Text>
            <Text style={{ marginLeft: 6, color: "#27AE60" }}>
              {successMsg}
            </Text>
          </View>
        ) : null}

        {/* Admin Profile Section */}
        <ConfigSection title="👤 Thông tin Admin">
          <View style={styles.profileContainer}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {userProfile?.fullName?.charAt(0) || "A"}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {userProfile?.fullName || "Administrator"}
              </Text>
              <Text style={styles.profileRole}>
                {getRoleDisplayName(userProfile?.role || "administrator")}
              </Text>
              <Text style={styles.profileEmail}>
                {userProfile?.email || "admin@school.edu.vn"}
              </Text>
              <Text style={styles.profilePhone}>
                {userProfile?.phoneNumber || "N/A"}
              </Text>
            </View>
          </View>
          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatLabel}>Trạng thái</Text>
              <Text style={styles.profileStatValue}>
                {userProfile?.status === "active" ||
                userProfile?.status === "approved"
                  ? "🟢 Hoạt động"
                  : "🔴 Không hoạt động"}
              </Text>
            </View>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatLabel}>Quyền hạn</Text>
              <Text style={styles.profileStatValue}>
                {userProfile?.permissions?.includes("*")
                  ? "Tất cả quyền"
                  : `${userProfile?.permissions?.length || 0} quyền`}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => router.push("/(admin)/Profile")}
          >
            <Text style={styles.editProfileBtnText}>✏️ Chỉnh sửa Profile</Text>
          </TouchableOpacity>
        </ConfigSection>

        {/* School Information */}
        <ConfigSection
          title={
            <>
              <Text style={{ fontWeight: "bold" }}>
                🏫 Thông tin trường học
              </Text>
            </>
          }
        >
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            <View style={{ flex: 1, minWidth: (width - 80) / 2 }}>
              <InputField
                label="Tên trường"
                value={schoolInfo.name}
                onChangeText={(text) =>
                  setSchoolInfo((prev) => ({ ...prev, name: text }))
                }
                placeholder="Nhập tên trường"
                onDirty={() => setSchoolDirty(true)}
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
                onDirty={() => setSchoolDirty(true)}
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
            onDirty={() => setSchoolDirty(true)}
          />
          <InputField
            label="Website"
            value={schoolInfo.website}
            onChangeText={(text) =>
              setSchoolInfo((prev) => ({ ...prev, website: text }))
            }
            placeholder="Nhập website"
            onDirty={() => setSchoolDirty(true)}
          />
          <InputField
            label="Địa chỉ"
            value={schoolInfo.address}
            onChangeText={(text) =>
              setSchoolInfo((prev) => ({ ...prev, address: text }))
            }
            placeholder="Nhập địa chỉ"
            multiline
            onDirty={() => setSchoolDirty(true)}
          />
          {/* Save button bottom right */}
          {schoolDirty && (
            <TouchableOpacity
              style={styles.saveBtnBottom}
              onPress={handleSaveSchoolInfo}
              disabled={saving}
            >
              {saving ? (
                <Text style={styles.saveBtnText}>⏳</Text>
              ) : (
                <Text style={styles.saveBtnText}>💾 Lưu</Text>
              )}
            </TouchableOpacity>
          )}
        </ConfigSection>

        {/* Notification Settings */}
        <ConfigSection
          title={
            <>
              <Text style={{ fontWeight: "bold" }}>🔔 Cài đặt thông báo</Text>
            </>
          }
        >
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
                onDirty={() => setNotificationDirty(true)}
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
                onDirty={() => setNotificationDirty(true)}
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
                onDirty={() => setNotificationDirty(true)}
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
                onDirty={() => setNotificationDirty(true)}
              />
            </View>
          </View>
          {/* Save button bottom right */}
          {notificationDirty && (
            <TouchableOpacity
              style={styles.saveBtnBottom}
              onPress={handleSaveNotificationSettings}
              disabled={saving}
            >
              {saving ? (
                <Text style={styles.saveBtnText}>⏳</Text>
              ) : (
                <Text style={styles.saveBtnText}>💾 Lưu</Text>
              )}
            </TouchableOpacity>
          )}
        </ConfigSection>

        {/* System Settings */}
        <ConfigSection
          title={
            <>
              <Text style={{ fontWeight: "bold" }}>⚙️ Cài đặt hệ thống</Text>
            </>
          }
        >
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
                onDirty={() => setSystemDirty(true)}
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
                onDirty={() => setSystemDirty(true)}
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
                onDirty={() => setSystemDirty(true)}
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
                onDirty={() => setSystemDirty(true)}
              />
            </View>
          </View>
          {/* Save button bottom right */}
          {systemDirty && (
            <TouchableOpacity
              style={styles.saveBtnBottom}
              onPress={handleSaveSystemSettings}
              disabled={saving}
            >
              {saving ? (
                <Text style={styles.saveBtnText}>⏳</Text>
              ) : (
                <Text style={styles.saveBtnText}>💾 Lưu</Text>
              )}
            </TouchableOpacity>
          )}
        </ConfigSection>

        {/* Broadcast Message */}
        <ConfigSection
          title={
            <>
              <Text style={{ fontWeight: "bold" }}>📢 Gửi thông báo chung</Text>
            </>
          }
        >
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

        {/* Quick Actions */}
        <ConfigSection
          title={
            <>
              <Text style={{ fontWeight: "bold" }}>⚡ Thao tác nhanh</Text>
            </>
          }
        >
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            <ActionButton
              title="Sao lưu dữ liệu"
              onPress={handleBackupData}
              style={styles.quickActionButton}
              icon="🗄️"
            />
            <ActionButton
              title="Xuất dữ liệu"
              onPress={handleExportData}
              style={styles.quickActionButton}
              icon="📤"
            />
            <ActionButton
              title="Import Users"
              onPress={() => router.push("/(admin)/AdminImport")}
              style={styles.quickActionButton}
              icon="📥"
              testID="import-users-btn"
            />
            <ActionButton
              title="Kiểm tra hệ thống"
              onPress={handleSystemHealthCheck}
              style={styles.quickActionButton}
              icon="🔍"
              testID="check-btn"
            />
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
                      onPress: () => signOut(),
                    },
                  ]
                );
              }}
              style={styles.logoutButton}
              icon="🚪"
              testID="logout-btn"
            />
          </View>
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
  successMsg: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#27AE60" + "20",
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#27AE60",
  },
  header: {
    backgroundColor: MedicalColors.primary,
    paddingTop: 60,
    paddingBottom: 20,
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
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: MedicalColors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: MedicalColors.primary,
    fontWeight: "600",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
    color: MedicalColors.textSecondary,
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 13,
    color: MedicalColors.textSecondary,
  },
  profileStats: {
    flexDirection: "row",
    marginBottom: 16,
  },
  profileStat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: MedicalColors.backgroundSecondary,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  profileStatLabel: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
    marginBottom: 4,
  },
  profileStatValue: {
    fontSize: 13,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
  },
  editProfileBtn: {
    backgroundColor: MedicalColors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  editProfileBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
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
    minWidth: (width - 80) / 3,
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
  broadcastButton: {
    backgroundColor: "#3498DB",
  },
  quickActionButton: {
    backgroundColor: "#3498DB",
  },
  logoutButton: {
    backgroundColor: "#E74C3C",
  },
  saveBtnBottom: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#27AE60",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
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
