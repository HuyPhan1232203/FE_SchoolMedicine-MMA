import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  MedicalColors,
  MedicalIcons,
  RoleColors,
} from "../../constants/Colors";
import { useAuth } from "../../hooks/useAuth";
import { auth } from "../../lib/firebase";

const { width } = Dimensions.get("window");

interface SettingOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: "toggle" | "navigation" | "action";
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  color?: string;
  danger?: boolean;
}

const Setting = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState({
    healthReminders: true,
    emergencyAlerts: true,
    vaccinationNotices: true,
    reportUpdates: false,
    systemUpdates: true,
  });
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Mock user role - in real app this would come from user data
  const [userRole] = useState<"parent" | "medical_staff" | "administrator">(
    "parent"
  );

  const handleLogout = async () => {
    console.log("Logout pressed");
    if (Platform.OS === "web") {
      // Xử lý cho web
      if (
        window.confirm(
          "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống y tế trường học không?"
        )
      ) {
        try {
          await signOut(auth);
          await AsyncStorage.removeItem("loginTime");
          router.replace("/Login");
        } catch (error) {
          window.alert("Có lỗi khi đăng xuất!");
          console.error(error);
        }
      }
    } else {
      // Xử lý cho mobile (Android/iOS)
      Alert.alert(
        "Xác nhận đăng xuất",
        "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống y tế trường học không?",
        [
          {
            text: "Hủy",
            style: "cancel",
          },
          {
            text: "Đăng xuất",
            style: "destructive",
            onPress: async () => {
              try {
                await signOut(auth);
                await AsyncStorage.removeItem("loginTime");
                router.replace("/Login");
              } catch (error) {
                Alert.alert("Lỗi", "Có lỗi khi đăng xuất!");
                console.error(error);
              }
            },
          },
        ]
      );
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    // Here you would typically sync with backend
  };

  const getRoleInfo = () => {
    const roleInfo = {
      parent: {
        title: "Phụ huynh",
        description: "Theo dõi sức khỏe con em",
        icon: RoleColors.parent.icon,
        color: RoleColors.parent.primary,
      },
      medical_staff: {
        title: "Cán bộ Y tế",
        description: "Chăm sóc sức khỏe học sinh",
        icon: RoleColors.medical_staff.icon,
        color: RoleColors.medical_staff.primary,
      },
      administrator: {
        title: "Quản lý",
        description: "Điều hành hệ thống y tế",
        icon: RoleColors.administrator.icon,
        color: RoleColors.administrator.primary,
      },
    };
    return roleInfo[userRole];
  };

  const notificationSettings: SettingOption[] = [
    {
      id: "health-reminders",
      title: "Nhắc nhở sức khỏe",
      description: "Thông báo khám sức khỏe định kỳ",
      icon: MedicalIcons.bell,
      type: "toggle",
      value: notifications.healthReminders,
      onToggle: () => toggleNotification("healthReminders"),
    },
    {
      id: "emergency-alerts",
      title: "Cảnh báo khẩn cấp",
      description: "Thông báo tình huống y tế khẩn cấp",
      icon: MedicalIcons.alert,
      type: "toggle",
      value: notifications.emergencyAlerts,
      onToggle: () => toggleNotification("emergencyAlerts"),
      color: MedicalColors.error,
    },
    {
      id: "vaccination-notices",
      title: "Thông báo tiêm chủng",
      description: "Lịch tiêm chủng và nhắc nhở",
      icon: MedicalIcons.syringe,
      type: "toggle",
      value: notifications.vaccinationNotices,
      onToggle: () => toggleNotification("vaccinationNotices"),
    },
    {
      id: "report-updates",
      title: "Cập nhật báo cáo",
      description: "Thông báo báo cáo y tế mới",
      icon: MedicalIcons.report,
      type: "toggle",
      value: notifications.reportUpdates,
      onToggle: () => toggleNotification("reportUpdates"),
    },
    {
      id: "system-updates",
      title: "Cập nhật hệ thống",
      description: "Thông báo phiên bản và bảo trì",
      icon: "🔄",
      type: "toggle",
      value: notifications.systemUpdates,
      onToggle: () => toggleNotification("systemUpdates"),
    },
  ];

  const accountSettings: SettingOption[] = [
    {
      id: "profile",
      title: "Thông tin cá nhân",
      description: "Cập nhật thông tin tài khoản",
      icon: MedicalIcons.family,
      type: "navigation",
      onPress: () =>
        Alert.alert("Thông tin cá nhân", "Chức năng đang phát triển"),
    },
    {
      id: "security",
      title: "Bảo mật",
      description: "Mật khẩu và xác thực",
      icon: "🔒",
      type: "navigation",
      onPress: () => Alert.alert("Bảo mật", "Chức năng đang phát triển"),
    },
    {
      id: "data-sync",
      title: "Đồng bộ dữ liệu",
      description: "Sao lưu và khôi phục",
      icon: "☁️",
      type: "navigation",
      onPress: () => Alert.alert("Đồng bộ", "Dữ liệu đã được đồng bộ"),
    },
  ];

  const supportSettings: SettingOption[] = [
    {
      id: "help",
      title: "Trợ giúp",
      description: "Hướng dẫn sử dụng ứng dụng",
      icon: "❓",
      type: "navigation",
      onPress: () => Alert.alert("Trợ giúp", "Hotline hỗ trợ: 0123-456-789"),
    },
    {
      id: "contact",
      title: "Liên hệ y tế",
      description: "Thông tin liên hệ phòng y tế",
      icon: "📞",
      type: "navigation",
      onPress: () =>
        Alert.alert(
          "Liên hệ",
          "Email: yteschool@edu.vn\nHotline: 0123-456-789"
        ),
    },
    {
      id: "about",
      title: "Về ứng dụng",
      description: "Thông tin phiên bản và đội phát triển",
      icon: MedicalIcons.info,
      type: "navigation",
      onPress: () => setShowAboutModal(true),
    },
    {
      id: "privacy",
      title: "Chính sách bảo mật",
      description: "Quy định bảo vệ thông tin cá nhân",
      icon: "🛡️",
      type: "navigation",
      onPress: () => setShowPrivacyModal(true),
    },
  ];

  const renderSettingItem = (setting: SettingOption) => (
    <TouchableOpacity
      key={setting.id}
      style={[styles.settingItem, setting.danger && styles.dangerItem]}
      onPress={setting.onPress}
      disabled={setting.type === "toggle"}
    >
      <View style={styles.settingLeft}>
        <View
          style={[
            styles.settingIcon,
            setting.color && { backgroundColor: setting.color + "20" },
          ]}
        >
          <Text
            style={[
              styles.settingIconText,
              setting.color && { color: setting.color },
            ]}
          >
            {setting.icon}
          </Text>
        </View>
        <View style={styles.settingContent}>
          <Text
            style={[styles.settingTitle, setting.danger && styles.dangerText]}
          >
            {setting.title}
          </Text>
          <Text style={styles.settingDescription}>{setting.description}</Text>
        </View>
      </View>

      {setting.type === "toggle" && setting.onToggle && (
        <Switch
          value={setting.value || false}
          onValueChange={setting.onToggle}
          trackColor={{
            false: MedicalColors.borderMedium,
            true: (setting.color || MedicalColors.primary) + "40",
          }}
          thumbColor={
            setting.value ? setting.color || MedicalColors.primary : "#f4f3f4"
          }
        />
      )}

      {setting.type === "navigation" && (
        <Text style={styles.navigationArrow}>→</Text>
      )}
    </TouchableOpacity>
  );

  const roleInfo = getRoleInfo();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>{MedicalIcons.health}</Text>
          <Text style={styles.title}>Cài đặt</Text>
          <Text style={styles.subtitle}>Hệ thống quản lý y tế trường học</Text>
        </View>
      </View>

      {/* User Profile Card */}
      {user && (
        <View style={styles.userCard}>
          <View style={styles.userHeader}>
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: roleInfo.color },
              ]}
            >
              <Text style={styles.avatarIcon}>{roleInfo.icon}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{roleInfo.title}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userRole}>{roleInfo.description}</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Trạng thái email:</Text>
              <View
                style={[
                  styles.statusBadge,
                  user.emailVerified
                    ? styles.verifiedBadge
                    : styles.unverifiedBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    user.emailVerified
                      ? styles.verifiedText
                      : styles.unverifiedText,
                  ]}
                >
                  {user.emailVerified ? "✅ Đã xác minh" : "❌ Chưa xác minh"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày tham gia:</Text>
              <Text style={styles.infoValue}>
                {user.metadata.creationTime
                  ? new Date(user.metadata.creationTime).toLocaleDateString(
                      "vi-VN"
                    )
                  : "Không rõ"}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Notification Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {MedicalIcons.notification} Thông báo
        </Text>
        <View style={styles.settingsGroup}>
          {notificationSettings.map(renderSettingItem)}
        </View>
      </View>

      {/* Account Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Tài khoản</Text>
        <View style={styles.settingsGroup}>
          {accountSettings.map(renderSettingItem)}
        </View>
      </View>

      {/* Support & Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🆘 Hỗ trợ & Thông tin</Text>
        <View style={styles.settingsGroup}>
          {supportSettings.map(renderSettingItem)}
        </View>
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      {/* About Modal */}
      <Modal
        visible={showAboutModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Về ứng dụng</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowAboutModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.aboutSection}>
              <Text style={styles.aboutIcon}>{MedicalIcons.health}</Text>
              <Text style={styles.aboutTitle}>School Medicine</Text>
              <Text style={styles.aboutVersion}>Phiên bản 1.0.0</Text>
            </View>

            <View style={styles.aboutDescription}>
              <Text style={styles.aboutText}>
                Hệ thống quản lý y tế trường học toàn diện, giúp kết nối phụ
                huynh, cán bộ y tế và ban quản lý trong việc chăm sóc sức khỏe
                học sinh.
              </Text>

              <Text style={styles.featureTitle}>✨ Tính năng chính:</Text>
              <Text style={styles.featureItem}>
                • Theo dõi sức khỏe học sinh
              </Text>
              <Text style={styles.featureItem}>• Quản lý lịch tiêm chủng</Text>
              <Text style={styles.featureItem}>• Báo cáo y tế chi tiết</Text>
              <Text style={styles.featureItem}>• Thông báo khẩn cấp</Text>
              <Text style={styles.featureItem}>• Kết nối đa vai trò</Text>
            </View>

            <View style={styles.aboutFooter}>
              <Text style={styles.copyright}>© 2024 School Medicine MMA</Text>
              <Text style={styles.developer}>Phát triển bởi đội ngũ MMA</Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Privacy Modal */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chính sách bảo mật</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPrivacyModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.privacySection}>
              <Text style={styles.privacyTitle}>🛡️ Cam kết bảo mật</Text>
              <Text style={styles.privacyText}>
                Chúng tôi cam kết bảo vệ thông tin cá nhân và dữ liệu y tế của
                bạn theo các tiêu chuẩn bảo mật cao nhất.
              </Text>

              <Text style={styles.privacySubtitle}>📋 Thu thập thông tin</Text>
              <Text style={styles.privacyText}>
                • Thông tin cá nhân cơ bản (họ tên, email, số điện thoại){"\n"}•
                Dữ liệu sức khỏe của học sinh{"\n"}• Lịch sử khám bệnh và tiêm
                chủng{"\n"}• Thông tin liên hệ khẩn cấp
              </Text>

              <Text style={styles.privacySubtitle}>🔒 Bảo mật dữ liệu</Text>
              <Text style={styles.privacyText}>
                • Mã hóa dữ liệu end-to-end{"\n"}• Xác thực đa yếu tố{"\n"}• Sao
                lưu định kỳ và an toàn{"\n"}• Tuân thủ quy định về bảo vệ dữ
                liệu
              </Text>

              <Text style={styles.privacySubtitle}>👥 Chia sẻ thông tin</Text>
              <Text style={styles.privacyText}>
                Thông tin của bạn chỉ được chia sẻ với:{"\n"}• Cán bộ y tế
                trường học{"\n"}• Ban quản lý có thẩm quyền{"\n"}• Cơ quan y tế
                khi có yêu cầu hợp pháp{"\n"}• Không bán hoặc cho thuê thông tin
                của bạn
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {MedicalIcons.school} School Medicine v1.0.0
        </Text>
        <Text style={styles.footerText}>© 2024 - Bảo vệ sức khỏe học sinh</Text>
      </View>
    </ScrollView>
  );
};

export default Setting;

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
  headerContent: {
    alignItems: "center",
  },
  headerIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  userCard: {
    backgroundColor: MedicalColors.backgroundCard,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 16,
    padding: 20,
    shadowColor: MedicalColors.shadowMedium,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarIcon: {
    fontSize: 28,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 12,
    color: MedicalColors.textMuted,
    fontStyle: "italic",
  },
  infoSection: {
    borderTopWidth: 1,
    borderTopColor: MedicalColors.border,
    paddingTop: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    flex: 1,
    textAlign: "right",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flex: 1,
    alignItems: "flex-end",
  },
  verifiedBadge: {
    backgroundColor: MedicalColors.success + "20",
  },
  unverifiedBadge: {
    backgroundColor: MedicalColors.error + "20",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  verifiedText: {
    color: MedicalColors.success,
  },
  unverifiedText: {
    color: MedicalColors.error,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 15,
  },
  settingsGroup: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: MedicalColors.border,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MedicalColors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  settingIconText: {
    fontSize: 20,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
  },
  navigationArrow: {
    fontSize: 18,
    color: MedicalColors.textMuted,
  },
  dangerItem: {
    backgroundColor: MedicalColors.error + "05",
  },
  dangerText: {
    color: MedicalColors.error,
  },
  logoutButton: {
    backgroundColor: MedicalColors.error,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 20,
    shadowColor: MedicalColors.error,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: MedicalColors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: MedicalColors.primary,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  aboutSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  aboutIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: MedicalColors.primary,
    marginBottom: 5,
  },
  aboutVersion: {
    fontSize: 16,
    color: MedicalColors.textSecondary,
  },
  aboutDescription: {
    marginBottom: 30,
  },
  aboutText: {
    fontSize: 16,
    color: MedicalColors.textPrimary,
    lineHeight: 24,
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 10,
  },
  featureItem: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    lineHeight: 20,
    marginBottom: 5,
  },
  aboutFooter: {
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: MedicalColors.border,
    paddingTop: 20,
  },
  copyright: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    marginBottom: 5,
  },
  developer: {
    fontSize: 12,
    color: MedicalColors.textMuted,
  },
  privacySection: {
    marginBottom: 30,
  },
  privacyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: MedicalColors.primary,
    marginBottom: 15,
  },
  privacySubtitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginTop: 20,
    marginBottom: 10,
  },
  privacyText: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    lineHeight: 20,
    marginBottom: 15,
  },
  footer: {
    alignItems: "center",
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: MedicalColors.textMuted,
    marginBottom: 4,
  },
});
