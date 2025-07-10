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

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  requirements: string[];
}

export default function ChangePassword() {
  const { userProfile } = useAuth();
  useEffect(() => {
    if (
      userProfile &&
      !["administrator", "director", "manager"].includes(userProfile.role)
    ) {
      router.replace("/Login");
    }
  }, [userProfile]);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const userRole = userProfile?.role || "administrator";

  const checkPasswordStrength = (password: string): PasswordStrength => {
    const requirements = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
      requirements.push("✓ Ít nhất 8 ký tự");
    } else {
      requirements.push("✗ Ít nhất 8 ký tự");
    }

    if (/[a-z]/.test(password)) {
      score += 1;
      requirements.push("✓ Có chữ thường");
    } else {
      requirements.push("✗ Có chữ thường");
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
      requirements.push("✓ Có chữ hoa");
    } else {
      requirements.push("✗ Có chữ hoa");
    }

    if (/[0-9]/.test(password)) {
      score += 1;
      requirements.push("✓ Có số");
    } else {
      requirements.push("✗ Có số");
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
      requirements.push("✓ Có ký tự đặc biệt");
    } else {
      requirements.push("✗ Có ký tự đặc biệt");
    }

    let label = "";
    let color = "";

    switch (score) {
      case 0:
      case 1:
        label = "Rất yếu";
        color = MedicalColors.error;
        break;
      case 2:
        label = "Yếu";
        color = MedicalColors.warning;
        break;
      case 3:
        label = "Trung bình";
        color = MedicalColors.accent;
        break;
      case 4:
        label = "Mạnh";
        color = MedicalColors.success;
        break;
      case 5:
        label = "Rất mạnh";
        color = MedicalColors.primary;
        break;
      default:
        label = "Không xác định";
        color = MedicalColors.textSecondary;
    }

    return { score, label, color, requirements };
  };

  const passwordStrength = checkPasswordStrength(passwordForm.newPassword);

  const handleChangePassword = () => {
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

    if (passwordStrength.score < 3) {
      Alert.alert(
        "Lỗi",
        "Mật khẩu mới quá yếu. Vui lòng chọn mật khẩu mạnh hơn."
      );
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới không được trùng với mật khẩu hiện tại");
      return;
    }

    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn đổi mật khẩu?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đổi mật khẩu",
        onPress: () => {
          Alert.alert("Thành công", "Mật khẩu đã được thay đổi thành công");
          setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <CustomHeader
        title="Đổi mật khẩu"
        subtitle="Bảo mật tài khoản của bạn"
        icon={<Text style={{ fontSize: 14 }}>{MedicalIcons.security}</Text>}
        showBack={true}
        onBack={() => router.back()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userProfile?.fullName?.charAt(0) || "A"}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {userProfile?.fullName || "Quản trị viên"}
            </Text>
            <Text style={styles.userRole}>{getRoleText(userRole)}</Text>
            <Text style={styles.userEmail}>{userProfile?.email}</Text>
          </View>
        </View>

        {/* Password Form */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>🔐 Thông tin mật khẩu</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mật khẩu hiện tại *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={passwordForm.currentPassword}
                onChangeText={(text) =>
                  setPasswordForm({ ...passwordForm, currentPassword: text })
                }
                placeholder="Nhập mật khẩu hiện tại"
                secureTextEntry={!showCurrentPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Text style={styles.eyeIcon}>
                  {showCurrentPassword ? "👁️" : "👁️‍🗨️"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mật khẩu mới *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={passwordForm.newPassword}
                onChangeText={(text) =>
                  setPasswordForm({ ...passwordForm, newPassword: text })
                }
                placeholder="Nhập mật khẩu mới"
                secureTextEntry={!showNewPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Text style={styles.eyeIcon}>
                  {showNewPassword ? "👁️" : "👁️‍🗨️"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Xác nhận mật khẩu mới *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={passwordForm.confirmPassword}
                onChangeText={(text) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: text })
                }
                placeholder="Nhập lại mật khẩu mới"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text style={styles.eyeIcon}>
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Password Strength Indicator */}
          {passwordForm.newPassword.length > 0 && (
            <View style={styles.strengthContainer}>
              <Text style={styles.strengthTitle}>Độ mạnh mật khẩu:</Text>
              <View style={styles.strengthBar}>
                <View
                  style={[
                    styles.strengthFill,
                    {
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      backgroundColor: passwordStrength.color,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.strengthLabel,
                  { color: passwordStrength.color },
                ]}
              >
                {passwordStrength.label}
              </Text>

              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>Yêu cầu bảo mật:</Text>
                {passwordStrength.requirements.map((requirement, index) => (
                  <Text key={index} style={styles.requirement}>
                    {requirement}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Security Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Lời khuyên bảo mật</Text>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>🔒</Text>
            <Text style={styles.tipText}>
              Sử dụng mật khẩu dài ít nhất 8 ký tự
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>🔤</Text>
            <Text style={styles.tipText}>
              Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>🚫</Text>
            <Text style={styles.tipText}>
              Không sử dụng thông tin cá nhân dễ đoán
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>🔄</Text>
            <Text style={styles.tipText}>
              Thay đổi mật khẩu định kỳ 3-6 tháng
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>📱</Text>
            <Text style={styles.tipText}>
              Không chia sẻ mật khẩu với người khác
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
            }}
          >
            <Text style={styles.cancelButtonText}>Làm mới</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.changeButton,
              (!passwordForm.currentPassword ||
                !passwordForm.newPassword ||
                !passwordForm.confirmPassword) &&
                styles.disabledButton,
            ]}
            onPress={handleChangePassword}
            disabled={
              !passwordForm.currentPassword ||
              !passwordForm.newPassword ||
              !passwordForm.confirmPassword
            }
          >
            <Text style={styles.changeButtonText}>Đổi mật khẩu</Text>
          </TouchableOpacity>
        </View>
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
  userRole: {
    fontSize: 14,
    color: MedicalColors.primary,
    fontWeight: "500",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
  },
  formContainer: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 20,
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: MedicalColors.border,
    borderRadius: 8,
    backgroundColor: MedicalColors.inputBackground,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  passwordInput: {
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  eyeButton: {
    padding: 12,
  },
  eyeIcon: {
    fontSize: 16,
  },
  strengthContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: MedicalColors.background,
    borderRadius: 8,
  },
  strengthTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    marginBottom: 10,
  },
  strengthBar: {
    height: 6,
    backgroundColor: MedicalColors.border,
    borderRadius: 3,
    marginBottom: 8,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: 3,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 10,
  },
  requirementsContainer: {
    marginTop: 10,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    marginBottom: 5,
  },
  requirement: {
    fontSize: 11,
    color: MedicalColors.textSecondary,
    marginBottom: 2,
  },
  tipsContainer: {
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
  tipsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 15,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tipIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  tipText: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    flex: 1,
  },
  actionContainer: {
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
  changeButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: MedicalColors.primary,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: MedicalColors.border,
  },
  changeButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
});
