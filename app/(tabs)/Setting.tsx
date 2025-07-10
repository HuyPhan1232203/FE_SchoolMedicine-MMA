import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import CustomHeader from "../../components/CustomHeader";
import { MedicalColors, MedicalIcons } from "../../constants/Colors";
import { useAuth } from "../../hooks/useAuth";

const { width } = Dimensions.get("window");

interface SettingItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
  requiresAdmin?: boolean;
}

interface ProfileForm {
  fullName: string;
  email: string;
  phone: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Setting() {
  const { user, userProfile, signOut } = useAuth();
  const router = useRouter();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSystemLogModal, setShowSystemLogModal] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    fullName: userProfile?.fullName || "",
    email: userProfile?.email || "",
    phone: userProfile?.phoneNumber || "",
  });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const userRole = userProfile?.role || "parent";

  useEffect(() => {
    if (userProfile && userProfile.role === "administrator") {
      // router.replace("/(admin)/Dashboard"); // This line is removed
    }
  }, [userProfile]); // Removed router from dependency array

  const getRoleBasedSettings = (): SettingItem[] => {
    const commonSettings = [
      {
        id: "profile",
        title: "Thông tin cá nhân",
        description: "Cập nhật thông tin cá nhân",
        icon: MedicalIcons.profile,
        color: MedicalColors.primary,
        action: () => setShowProfileModal(true),
      },
      {
        id: "password",
        title: "Đổi mật khẩu",
        description: "Thay đổi mật khẩu đăng nhập",
        icon: MedicalIcons.security,
        color: MedicalColors.warning,
        action: () => setShowPasswordModal(true),
      },
      {
        id: "notifications",
        title: "Thông báo",
        description: "Cài đặt thông báo và cảnh báo",
        icon: MedicalIcons.notification,
        color: MedicalColors.accent,
        action: () => Alert.alert("Thông báo", "Cài đặt thông báo đã được lưu"),
      },
      {
        id: "language",
        title: "Ngôn ngữ",
        description: "Chọn ngôn ngữ hiển thị",
        icon: MedicalIcons.language,
        color: MedicalColors.secondary,
        action: () => Alert.alert("Ngôn ngữ", "Đã chuyển sang tiếng Việt"),
      },
    ];

    if (userRole === "administrator") {
      return [
        ...commonSettings,
        {
          id: "user-management",
          title: "Quản lý người dùng",
          description: "Quản lý tài khoản và phân quyền",
          icon: MedicalIcons.users,
          color: MedicalColors.primary,
          action: () => router.push("/(admin)/UserManagement"),
          requiresAdmin: true,
        },
        {
          id: "request-approval",
          title: "Duyệt yêu cầu",
          description: "Duyệt các yêu cầu đăng ký tài khoản",
          icon: MedicalIcons.approval,
          color: MedicalColors.warning,
          action: () => router.push("/(admin)/RequestApproval"),
          requiresAdmin: true,
        },
        {
          id: "system-config",
          title: "Cấu hình hệ thống",
          description: "Cài đặt tham số hệ thống",
          icon: MedicalIcons.settings,
          color: MedicalColors.secondary,
          action: () => router.push("/(admin)/SystemConfig"),
          requiresAdmin: true,
        },
        {
          id: "data-import",
          title: "Nhập dữ liệu",
          description: "Import dữ liệu từ file Excel/CSV",
          icon: MedicalIcons.import,
          color: MedicalColors.accent,
          action: () => router.push("/(admin)/AdminImport"),
          requiresAdmin: true,
        },
        {
          id: "system-logs",
          title: "Log hệ thống",
          description: "Xem nhật ký hoạt động hệ thống",
          icon: MedicalIcons.logs,
          color: MedicalColors.textSecondary,
          action: () => setShowSystemLogModal(true),
          requiresAdmin: true,
        },
        {
          id: "backup-restore",
          title: "Sao lưu & Khôi phục",
          description: "Quản lý dữ liệu hệ thống",
          icon: MedicalIcons.backup,
          color: MedicalColors.success,
          action: () => Alert.alert("Sao lưu", "Đã tạo bản sao lưu thành công"),
          requiresAdmin: true,
        },
      ];
    }

    if (userRole === "medical_staff") {
      return [
        ...commonSettings,
        {
          id: "medical-records",
          title: "Hồ sơ y tế",
          description: "Quản lý hồ sơ khám bệnh",
          icon: MedicalIcons.records,
          color: MedicalColors.primary,
          action: () =>
            Alert.alert("Hồ sơ y tế", "Chức năng quản lý hồ sơ y tế"),
        },
        {
          id: "schedule",
          title: "Lịch làm việc",
          description: "Quản lý lịch khám và làm việc",
          icon: MedicalIcons.calendar,
          color: MedicalColors.accent,
          action: () =>
            Alert.alert("Lịch làm việc", "Chức năng quản lý lịch làm việc"),
        },
      ];
    }

    return [
      ...commonSettings,
      {
        id: "child-info",
        title: "Thông tin con",
        description: "Xem và cập nhật thông tin con",
        icon: MedicalIcons.child,
        color: MedicalColors.primary,
        action: () =>
          Alert.alert("Thông tin con", "Chức năng quản lý thông tin con"),
      },
      {
        id: "emergency-contacts",
        title: "Liên hệ khẩn cấp",
        description: "Quản lý danh bạ liên hệ khẩn cấp",
        icon: MedicalIcons.emergency,
        color: MedicalColors.error,
        action: () =>
          Alert.alert("Liên hệ khẩn cấp", "Chức năng quản lý liên hệ khẩn cấp"),
      },
    ];
  };

  const handleProfileUpdate = () => {
    if (!profileForm.fullName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ tên");
      return;
    }

    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn cập nhật thông tin cá nhân?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Cập nhật",
          onPress: () => {
            Alert.alert("Thành công", "Thông tin cá nhân đã được cập nhật");
            setShowProfileModal(false);
          },
        },
      ]
    );
  };

  const handlePasswordChange = () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới không khớp");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn đổi mật khẩu?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đổi mật khẩu",
        onPress: () => {
          Alert.alert("Thành công", "Mật khẩu đã được thay đổi");
          setShowPasswordModal(false);
          setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        },
      },
    ]);
  };

  const handleSignOut = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => {
          signOut();
          router.replace("/Login");
        },
      },
    ]);
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "administrator":
        return "Quản trị viên";
      case "medical_staff":
        return "Cán bộ y tế";
      case "parent":
        return "Phụ huynh";
      default:
        return "Người dùng";
    }
  };

  // Group settings by section
  const sections = [
    {
      title: "Tài khoản",
      data: getRoleBasedSettings().filter((item) =>
        ["profile", "password", "notifications", "language"].includes(item.id)
      ),
    },
    userRole === "administrator" && {
      title: "Quản trị hệ thống",
      data: getRoleBasedSettings().filter((item) => item.requiresAdmin),
    },
    {
      title: "Hệ thống",
      data: [
        {
          id: "system-info",
          title: "Thông tin hệ thống",
          description:
            "Phiên bản: 1.0.0\nCập nhật: 15/12/2024\nTrạng thái: Hoạt động bình thường",
          icon: MedicalIcons.info,
          color: MedicalColors.secondary,
          action: () => {},
        },
      ],
    },
  ].filter(Boolean) as { title: string; data: SettingItem[] }[];

  // Accordion/collapse logic
  const handleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <>
      <CustomHeader
        title="Cài đặt"
        icon={<Text style={{ fontSize: 14 }}>{MedicalIcons.settings}</Text>}
        actions={
          <TouchableOpacity onPress={handleSignOut}>
            <Text style={{ color: "white", fontSize: 16, marginLeft: 8 }}>
              🚪
            </Text>
          </TouchableOpacity>
        }
      />
      <View style={styles.container}>
        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userProfile?.fullName?.charAt(0) ||
                user?.email?.charAt(0) ||
                "U"}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {userProfile?.fullName || "Người dùng"}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <Text style={styles.userRole}>{getRoleText(userRole)}</Text>
          </View>
        </View>

        {/* Nút Đăng xuất nổi bật ở đầu */}
        <View style={styles.signOutContainerTop}>
          <TouchableOpacity
            style={styles.signOutButtonTop}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutIconTop}>🚪</Text>
            <Text style={styles.signOutTextTop}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section: { title } }) => (
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: MedicalColors.textPrimary,
                marginBottom: 15,
              }}
            >
              {title}
            </Text>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                backgroundColor: "white",
                flexDirection: "row",
                alignItems: "center",
                padding: 15,
                borderRadius: 12,
                marginBottom: 10,
                shadowColor: MedicalColors.shadowLight,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={() => {
                if (item.action) item.action();
                handleExpand(item.id);
              }}
              activeOpacity={0.85}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: MedicalColors.primary + "20",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 15,
                }}
              >
                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: MedicalColors.textPrimary,
                    marginBottom: 2,
                  }}
                >
                  {item.title}
                </Text>
                {expandedId === item.id && (
                  <Text
                    style={{ fontSize: 14, color: MedicalColors.textSecondary }}
                  >
                    {item.description}
                  </Text>
                )}
              </View>
              <Text
                style={{ fontSize: 18, color: MedicalColors.textSecondary }}
              >
                {expandedId === item.id ? "▲" : "▼"}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
        />

        {/* Profile Update Modal */}
        <Modal
          visible={showProfileModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowProfileModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Cập nhật thông tin cá nhân
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowProfileModal(false)}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Họ và tên *</Text>
                  <TextInput
                    style={styles.input}
                    value={profileForm.fullName}
                    onChangeText={(text) =>
                      setProfileForm({ ...profileForm, fullName: text })
                    }
                    placeholder="Nhập họ và tên"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={profileForm.email}
                    editable={false}
                    placeholder="Email (không thể thay đổi)"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Số điện thoại</Text>
                  <TextInput
                    style={styles.input}
                    value={profileForm.phone}
                    onChangeText={(text) =>
                      setProfileForm({ ...profileForm, phone: text })
                    }
                    placeholder="Nhập số điện thoại"
                    keyboardType="phone-pad"
                  />
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowProfileModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleProfileUpdate}
                >
                  <Text style={styles.confirmButtonText}>Cập nhật</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Password Change Modal */}
        <Modal
          visible={showPasswordModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowPasswordModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowPasswordModal(false)}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mật khẩu hiện tại *</Text>
                  <TextInput
                    style={styles.input}
                    value={passwordForm.currentPassword}
                    onChangeText={(text) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: text,
                      })
                    }
                    placeholder="Nhập mật khẩu hiện tại"
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mật khẩu mới *</Text>
                  <TextInput
                    style={styles.input}
                    value={passwordForm.newPassword}
                    onChangeText={(text) =>
                      setPasswordForm({ ...passwordForm, newPassword: text })
                    }
                    placeholder="Nhập mật khẩu mới"
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Xác nhận mật khẩu mới *</Text>
                  <TextInput
                    style={styles.input}
                    value={passwordForm.confirmPassword}
                    onChangeText={(text) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: text,
                      })
                    }
                    placeholder="Nhập lại mật khẩu mới"
                    secureTextEntry
                  />
                </View>

                <View style={styles.passwordRules}>
                  <Text style={styles.passwordRulesTitle}>
                    Yêu cầu mật khẩu:
                  </Text>
                  <Text style={styles.passwordRule}>• Ít nhất 6 ký tự</Text>
                  <Text style={styles.passwordRule}>
                    • Bao gồm chữ hoa và chữ thường
                  </Text>
                  <Text style={styles.passwordRule}>
                    • Bao gồm số và ký tự đặc biệt
                  </Text>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowPasswordModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handlePasswordChange}
                >
                  <Text style={styles.confirmButtonText}>Đổi mật khẩu</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* System Logs Modal */}
        <Modal
          visible={showSystemLogModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowSystemLogModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Log hệ thống</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowSystemLogModal(false)}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <Text style={styles.logTitle}>📋 Hoạt động gần đây:</Text>
                <View style={styles.logContainer}>
                  <Text style={styles.logEntry}>
                    ✅ 2024-12-15 09:30 - User admin@school.edu.vn logged in
                  </Text>
                  <Text style={styles.logEntry}>
                    ✅ 2024-12-15 09:25 - 5 new user registrations approved
                  </Text>
                  <Text style={styles.logEntry}>
                    ✅ 2024-12-15 09:20 - System backup completed
                  </Text>
                  <Text style={styles.logEntry}>
                    ✅ 2024-12-15 09:15 - Database maintenance finished
                  </Text>
                  <Text style={styles.logEntry}>
                    ✅ 2024-12-15 09:10 - Email notifications sent (15 users)
                  </Text>
                  <Text style={styles.logEntry}>
                    ✅ 2024-12-15 09:05 - Security scan completed
                  </Text>
                  <Text style={styles.logEntry}>
                    ✅ 2024-12-15 09:00 - System startup completed
                  </Text>
                  <Text style={styles.logEntry}>
                    ⚠️ 2024-12-15 08:55 - High memory usage detected
                  </Text>
                  <Text style={styles.logEntry}>
                    ✅ 2024-12-15 08:50 - Backup verification successful
                  </Text>
                  <Text style={styles.logEntry}>
                    ✅ 2024-12-15 08:45 - User session cleanup completed
                  </Text>
                </View>

                <View style={styles.systemStatus}>
                  <Text style={styles.systemStatusTitle}>
                    🟢 Trạng thái hệ thống:
                  </Text>
                  <Text style={styles.systemStatusText}>
                    • Tất cả dịch vụ hoạt động bình thường
                  </Text>
                  <Text style={styles.systemStatusText}>• Bảo mật: Tốt</Text>
                  <Text style={styles.systemStatusText}>• Hiệu suất: 95%</Text>
                  <Text style={styles.systemStatusText}>
                    • Băng thông: Ổn định
                  </Text>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowSystemLogModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Đóng</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => {
                    Alert.alert(
                      "Xuất log",
                      "Log hệ thống đã được xuất thành công"
                    );
                    setShowSystemLogModal(false);
                  }}
                >
                  <Text style={styles.confirmButtonText}>Xuất log</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
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
  userInfo: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    margin: 20,
    borderRadius: 12,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: MedicalColors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: MedicalColors.primary,
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  settingsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 15,
  },
  settingItem: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MedicalColors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  settingIconText: {
    fontSize: 18,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
  },
  adminBadge: {
    backgroundColor: MedicalColors.error + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
  },
  adminBadgeText: {
    fontSize: 10,
    color: MedicalColors.error,
    fontWeight: "bold",
  },
  settingArrow: {
    fontSize: 18,
    color: MedicalColors.textSecondary,
  },
  systemInfo: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: MedicalColors.textPrimary,
    fontWeight: "500",
  },
  signOutContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  signOutButton: {
    backgroundColor: MedicalColors.error + "20",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MedicalColors.error,
  },
  signOutIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  signOutText: {
    fontSize: 16,
    color: MedicalColors.error,
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
  disabledInput: {
    backgroundColor: MedicalColors.border,
    color: MedicalColors.textSecondary,
  },
  passwordRules: {
    backgroundColor: MedicalColors.primary + "10",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  passwordRulesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    marginBottom: 8,
  },
  passwordRule: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
    marginBottom: 4,
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
  logTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 15,
  },
  logContainer: {
    backgroundColor: MedicalColors.background,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  logEntry: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
    marginBottom: 8,
    fontFamily: "monospace",
  },
  systemStatus: {
    backgroundColor: MedicalColors.success + "10",
    borderRadius: 8,
    padding: 15,
  },
  systemStatusTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 10,
  },
  systemStatusText: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
    marginBottom: 5,
  },
  // New styles for SectionList
  settingItemCard: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingIconCard: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MedicalColors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  settingIconTextCard: {
    fontSize: 18,
  },
  settingInfoCard: {
    flex: 1,
  },
  settingTitleCard: {
    fontSize: 16,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    marginBottom: 2,
  },
  settingDescriptionCard: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
  },
  settingArrowCard: {
    fontSize: 18,
    color: MedicalColors.textSecondary,
  },
  signOutContainerTop: {
    padding: 20,
    paddingBottom: 0, // Adjust padding to be above the SectionList
  },
  signOutButtonTop: {
    backgroundColor: MedicalColors.error + "20",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MedicalColors.error,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  signOutIconTop: {
    fontSize: 18,
    marginRight: 10,
  },
  signOutTextTop: {
    fontSize: 16,
    color: MedicalColors.error,
    fontWeight: "bold",
  },
});
