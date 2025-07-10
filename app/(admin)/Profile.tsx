import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
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

interface ProfileForm {
  fullName: string;
  email: string;
  phone: string;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  sessionTimeout: number;
}

export default function Profile() {
  const { user, userProfile } = useAuth();
  useEffect(() => {
    if (userProfile && userProfile.role !== "administrator") {
      router.replace("/Login");
    }
  }, [userProfile]);
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    fullName: userProfile?.fullName || "",
    email: userProfile?.email || "",
    phone: userProfile?.phoneNumber || "",
  });
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    emailNotifications: true,
    pushNotifications: true,
    sessionTimeout: 30,
  });

  const userRole = userProfile?.role || "administrator";

  const handleSaveProfile = () => {
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
            setIsEditing(false);
          },
        },
      ]
    );
  };

  const handleCancelEdit = () => {
    setProfileForm({
      fullName: userProfile?.fullName || "",
      email: userProfile?.email || "",
      phone: userProfile?.phoneNumber || "",
    });
    setIsEditing(false);
  };

  const toggleSecuritySetting = (setting: keyof SecuritySettings) => {
    setSecuritySettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return MedicalColors.success;
      case "pending":
        return MedicalColors.warning;
      case "inactive":
        return MedicalColors.error;
      default:
        return MedicalColors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Hoạt động";
      case "pending":
        return "Chờ duyệt";
      case "inactive":
        return "Không hoạt động";
      default:
        return "Không xác định";
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <CustomHeader
        title="Hồ sơ cá nhân"
        subtitle="Quản lý thông tin tài khoản"
        icon={<Text style={{ fontSize: 14 }}>{MedicalIcons.profile}</Text>}
        showBack={true}
        onBack={() => router.back()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profileForm.fullName.charAt(0) ||
                  user?.email?.charAt(0) ||
                  "A"}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {profileForm.fullName || "Quản trị viên"}
              </Text>
              <Text style={styles.profileRole}>{getRoleText(userRole)}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor("active") + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor("active") },
                  ]}
                >
                  {getStatusText("active")}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Text style={styles.editButtonText}>
                {isEditing ? "Hủy" : "Chỉnh sửa"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Thông tin cá nhân</Text>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Họ và tên *</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.disabledInput]}
                value={profileForm.fullName}
                onChangeText={(text) =>
                  setProfileForm({ ...profileForm, fullName: text })
                }
                placeholder="Nhập họ và tên"
                editable={isEditing}
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
                style={[styles.input, !isEditing && styles.disabledInput]}
                value={profileForm.phone}
                onChangeText={(text) =>
                  setProfileForm({ ...profileForm, phone: text })
                }
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
                editable={isEditing}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phòng ban</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.disabledInput]}
                value={userProfile?.department || "Phòng Y tế"}
                editable={false}
                placeholder="Phòng Y tế"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Chức vụ</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.disabledInput]}
                value={userProfile?.position || "Quản trị viên"}
                editable={false}
                placeholder="Quản trị viên"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Địa chỉ</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  !isEditing && styles.disabledInput,
                ]}
                value={userProfile?.address || ""}
                editable={false}
                placeholder="Địa chỉ"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Liên hệ khẩn cấp</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.disabledInput]}
                value={userProfile?.emergencyContact || ""}
                editable={false}
                placeholder="Tên người liên hệ khẩn cấp"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>SĐT liên hệ khẩn cấp</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.disabledInput]}
                value={userProfile?.emergencyPhone || ""}
                editable={false}
                placeholder="Số điện thoại liên hệ khẩn cấp"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Giới thiệu</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  !isEditing && styles.disabledInput,
                ]}
                value={userProfile?.bio || ""}
                editable={false}
                placeholder="Giới thiệu về bản thân..."
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        </View>

        {/* Security Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 Cài đặt bảo mật</Text>
          <View style={styles.securityContainer}>
            <View style={styles.securityItem}>
              <View style={styles.securityInfo}>
                <Text style={styles.securityTitle}>Xác thực 2 yếu tố</Text>
                <Text style={styles.securityDescription}>
                  Bảo mật tài khoản bằng mã xác thực
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  securitySettings.twoFactorAuth && styles.toggleActive,
                ]}
                onPress={() => toggleSecuritySetting("twoFactorAuth")}
              >
                <Text style={styles.toggleText}>
                  {securitySettings.twoFactorAuth ? "Bật" : "Tắt"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.securityItem}>
              <View style={styles.securityInfo}>
                <Text style={styles.securityTitle}>Thông báo email</Text>
                <Text style={styles.securityDescription}>
                  Nhận thông báo qua email
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  securitySettings.emailNotifications && styles.toggleActive,
                ]}
                onPress={() => toggleSecuritySetting("emailNotifications")}
              >
                <Text style={styles.toggleText}>
                  {securitySettings.emailNotifications ? "Bật" : "Tắt"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.securityItem}>
              <View style={styles.securityInfo}>
                <Text style={styles.securityTitle}>Thông báo đẩy</Text>
                <Text style={styles.securityDescription}>
                  Nhận thông báo trên thiết bị
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  securitySettings.pushNotifications && styles.toggleActive,
                ]}
                onPress={() => toggleSecuritySetting("pushNotifications")}
              >
                <Text style={styles.toggleText}>
                  {securitySettings.pushNotifications ? "Bật" : "Tắt"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Account Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Thống kê tài khoản</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>156</Text>
              <Text style={styles.statLabel}>Ngày hoạt động</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>1,234</Text>
              <Text style={styles.statLabel}>Lần đăng nhập</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>89</Text>
              <Text style={styles.statLabel}>Hành động</Text>
            </View>
          </View>
        </View>

        {/* Save Button */}
        {isEditing && (
          <View style={styles.saveContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelEdit}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
            >
              <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  profileCard: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: MedicalColors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 14,
    color: MedicalColors.primary,
    fontWeight: "500",
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    marginBottom: 5,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "500",
  },
  editButton: {
    backgroundColor: MedicalColors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    color: "white",
    fontWeight: "500",
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
  formContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  securityContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  securityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: MedicalColors.border,
  },
  securityInfo: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    marginBottom: 2,
  },
  securityDescription: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: MedicalColors.border,
  },
  toggleActive: {
    backgroundColor: MedicalColors.primary,
  },
  toggleText: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
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
  saveContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
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
  saveButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: MedicalColors.primary,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
});
