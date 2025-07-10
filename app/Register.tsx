import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CustomHeader from "../components/CustomHeader";
import { ErrorMessage, SuccessMessage } from "../components/ErrorMessage";
import { MedicalColors, MedicalIcons, RoleColors } from "../constants/Colors";
import { registerWithRetry } from "../services/authService";

type UserRole = "parent" | "medical_staff";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<UserRole>("parent");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Real-time validation
  useEffect(() => {
    const newErrors: Record<string, string> = {};

    // Full name validation
    if (fullName && (fullName.length < 2 || fullName.length > 50)) {
      newErrors.fullName = "Họ tên phải từ 2-50 ký tự";
    }

    // Email validation
    if (email && !isValidEmail(email)) {
      newErrors.email = "Định dạng email không hợp lệ";
    }

    // Password validation
    if (password) {
      if (password.length < 6) {
        newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      } else if (password.length < 8) {
        // Additional strength checking for medical app
        if (!/(?=.*[a-z])/.test(password)) {
          newErrors.password = "Mật khẩu nên chứa chữ thường";
        } else if (!/(?=.*[A-Z])/.test(password)) {
          newErrors.password = "Mật khẩu nên chứa chữ hoa";
        } else if (!/(?=.*\d)/.test(password)) {
          newErrors.password = "Mật khẩu nên chứa số";
        }
      }
    }

    // Confirm password validation
    if (confirmPassword && confirmPassword !== password) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    // Student ID validation (for parents)
    if (
      role === "parent" &&
      studentId &&
      (studentId.length < 6 || studentId.length > 20)
    ) {
      newErrors.studentId = "Mã học sinh phải từ 6-20 ký tự";
    }

    // Phone number validation
    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
  }, [
    fullName,
    email,
    password,
    confirmPassword,
    studentId,
    phoneNumber,
    role,
  ]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhoneNumber = (phone: string) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone.replace(/[^0-9]/g, ""));
  };

  const getPasswordStrength = (
    password: string
  ): { strength: "Yếu" | "Trung bình" | "Mạnh"; color: string } => {
    if (password.length < 6)
      return { strength: "Yếu", color: MedicalColors.error };

    let score = 0;
    if (password.length >= 8) score++;
    if (/(?=.*[a-z])/.test(password)) score++;
    if (/(?=.*[A-Z])/.test(password)) score++;
    if (/(?=.*\d)/.test(password)) score++;
    if (/(?=.*[!@#$%^&*])/.test(password)) score++;

    if (score >= 4) return { strength: "Mạnh", color: MedicalColors.success };
    if (score >= 2)
      return { strength: "Trung bình", color: MedicalColors.warning };
    return { strength: "Yếu", color: MedicalColors.error };
  };

  const isFormValid = () => {
    const requiredFields = [
      fullName,
      email,
      password,
      confirmPassword,
      phoneNumber,
    ];
    if (role === "parent") requiredFields.push(studentId);

    return (
      requiredFields.every((field) => field.trim() !== "") &&
      Object.keys(errors).length === 0 &&
      isValidEmail(email) &&
      password.length >= 6 &&
      password === confirmPassword
    );
  };

  const getRoleInfo = (roleType: UserRole) => {
    switch (roleType) {
      case "parent":
        return {
          title: "Phụ huynh",
          description: "Theo dõi sức khỏe con em",
          icon: RoleColors.parent.icon,
          color: RoleColors.parent.primary,
          background: RoleColors.parent.background,
        };
      case "medical_staff":
        return {
          title: "Cán bộ Y tế",
          description: "Quản lý y tế học sinh",
          icon: RoleColors.medical_staff.icon,
          color: RoleColors.medical_staff.primary,
          background: RoleColors.medical_staff.background,
        };
    }
  };

  const handleRegister = async () => {
    if (!isFormValid()) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin hợp lệ");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const userData = {
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        role,
        ...(role === "parent" && { studentId: studentId.trim() }),
      };

      await registerWithRetry(email.trim(), password, userData);

      setSuccessMessage(
        "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."
      );

      setTimeout(() => {
        router.push("/EmailVerification");
      }, 2000);
    } catch (error: any) {
      console.error("Registration error:", error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <CustomHeader
          title="Đăng ký tài khoản"
          subtitle="Tạo tài khoản mới"
          icon={<Text style={{ fontSize: 14 }}>{MedicalIcons.profile}</Text>}
        />

        {/* Registration Card */}
        <View style={styles.registrationCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.title}>Đăng ký tài khoản</Text>
            <Text style={styles.welcomeText}>
              Bắt đầu hành trình chăm sóc sức khỏe {MedicalIcons.stethoscope}
            </Text>
          </View>

          {/* Role Selection */}
          <View style={styles.roleSelection}>
            <Text style={styles.sectionTitle}>
              {MedicalIcons.info} Bạn là ai?
            </Text>
            <Text style={styles.roleNote}>
              💡 Tài khoản Quản trị viên được cấp bởi nhà trường
            </Text>
            <View style={styles.roleOptions}>
              {(["parent", "medical_staff"] as UserRole[]).map((roleType) => {
                const roleInfo = getRoleInfo(roleType);
                const isSelected = role === roleType;

                return (
                  <TouchableOpacity
                    key={roleType}
                    style={[
                      styles.roleOption,
                      isSelected && {
                        backgroundColor: roleInfo.background,
                        borderColor: roleInfo.color,
                        borderWidth: 2,
                      },
                    ]}
                    onPress={() => setRole(roleType)}
                  >
                    <Text style={styles.roleOptionIcon}>{roleInfo.icon}</Text>
                    <Text
                      style={[
                        styles.roleOptionTitle,
                        isSelected && {
                          color: roleInfo.color,
                          fontWeight: "bold",
                        },
                      ]}
                    >
                      {roleInfo.title}
                    </Text>
                    <Text style={styles.roleOptionDescription}>
                      {roleInfo.description}
                    </Text>
                    {isSelected && (
                      <View
                        style={[
                          styles.selectedIndicator,
                          { backgroundColor: roleInfo.color },
                        ]}
                      >
                        <Text style={styles.selectedText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Error Messages */}
          {errorMessage ? (
            <ErrorMessage
              error={errorMessage}
              type="auth"
              onDismiss={() => setErrorMessage("")}
            />
          ) : null}

          {/* Success Messages */}
          {successMessage ? (
            <SuccessMessage
              message={successMessage}
              onDismiss={() => setSuccessMessage("")}
            />
          ) : null}

          {/* Full Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{MedicalIcons.family} Họ và tên</Text>
            <TextInput
              style={[
                styles.input,
                errors.fullName && styles.inputError,
                !errors.fullName &&
                  fullName &&
                  fullName.length >= 2 &&
                  styles.inputSuccess,
              ]}
              placeholder="Nhập họ và tên đầy đủ"
              placeholderTextColor={MedicalColors.textMuted}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoCorrect={false}
            />
            {errors.fullName && (
              <Text style={styles.errorText}>⚠️ {errors.fullName}</Text>
            )}
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>📧 Email</Text>
            <TextInput
              style={[
                styles.input,
                errors.email && styles.inputError,
                !errors.email &&
                  email &&
                  isValidEmail(email) &&
                  styles.inputSuccess,
              ]}
              placeholder="Nhập địa chỉ email"
              placeholderTextColor={MedicalColors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email && (
              <Text style={styles.errorText}>⚠️ {errors.email}</Text>
            )}
          </View>

          {/* Phone Number Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>📱 Số điện thoại</Text>
            <TextInput
              style={[
                styles.input,
                errors.phoneNumber && styles.inputError,
                !errors.phoneNumber &&
                  phoneNumber &&
                  isValidPhoneNumber(phoneNumber) &&
                  styles.inputSuccess,
              ]}
              placeholder="Nhập số điện thoại"
              placeholderTextColor={MedicalColors.textMuted}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
            {errors.phoneNumber && (
              <Text style={styles.errorText}>⚠️ {errors.phoneNumber}</Text>
            )}
          </View>

          {/* Student ID Input (for parents only) */}
          {role === "parent" && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {MedicalIcons.student} Mã học sinh
              </Text>
              <TextInput
                style={[
                  styles.input,
                  errors.studentId && styles.inputError,
                  !errors.studentId &&
                    studentId &&
                    studentId.length >= 6 &&
                    styles.inputSuccess,
                ]}
                placeholder="Nhập mã học sinh"
                placeholderTextColor={MedicalColors.textMuted}
                value={studentId}
                onChangeText={setStudentId}
                autoCapitalize="characters"
              />
              {errors.studentId && (
                <Text style={styles.errorText}>⚠️ {errors.studentId}</Text>
              )}
              <Text style={styles.helperText}>
                Mã học sinh của con em tại trường
              </Text>
            </View>
          )}

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>🔒 Mật khẩu</Text>
            <TextInput
              style={[
                styles.input,
                errors.password && styles.inputError,
                !errors.password &&
                  password &&
                  password.length >= 6 &&
                  styles.inputSuccess,
              ]}
              placeholder="Nhập mật khẩu"
              placeholderTextColor={MedicalColors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.password && (
              <Text style={styles.errorText}>⚠️ {errors.password}</Text>
            )}
            {password && (
              <View style={styles.passwordStrength}>
                <Text
                  style={[
                    styles.strengthText,
                    { color: passwordStrength.color },
                  ]}
                >
                  Độ mạnh: {passwordStrength.strength}
                </Text>
              </View>
            )}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>🔐 Xác nhận mật khẩu</Text>
            <TextInput
              style={[
                styles.input,
                errors.confirmPassword && styles.inputError,
                !errors.confirmPassword &&
                  confirmPassword &&
                  confirmPassword === password &&
                  styles.inputSuccess,
              ]}
              placeholder="Nhập lại mật khẩu"
              placeholderTextColor={MedicalColors.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>⚠️ {errors.confirmPassword}</Text>
            )}
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[
              styles.registerButton,
              !isFormValid() && styles.registerButtonDisabled,
            ]}
            onPress={handleRegister}
            disabled={loading || !isFormValid()}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.registerButtonText}>
                {MedicalIcons.health} Tạo tài khoản
              </Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push("/Login")}>
              <Text style={styles.loginLink}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {MedicalIcons.school} Hệ thống School Medicine {MedicalIcons.health}
          </Text>
          <Text style={styles.footerSubtext}>
            Đăng ký để tham gia bảo vệ sức khỏe cộng đồng trường học
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MedicalColors.backgroundSecondary,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  logoIcon: {
    fontSize: 40,
    marginRight: 10,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: MedicalColors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: MedicalColors.textSecondary,
    fontWeight: "600",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: MedicalColors.textMuted,
    textAlign: "center",
  },
  registrationCard: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: MedicalColors.shadowMedium,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 5,
  },
  welcomeText: {
    fontSize: 14,
    color: MedicalColors.textMuted,
    textAlign: "center",
  },
  roleSelection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    marginBottom: 12,
  },
  roleNote: {
    fontSize: 12,
    color: MedicalColors.info,
    textAlign: "center",
    marginBottom: 12,
    fontStyle: "italic",
    backgroundColor: "#E3F2FD",
    padding: 8,
    borderRadius: 8,
  },
  roleOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  roleOption: {
    flex: 1,
    backgroundColor: MedicalColors.background,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: MedicalColors.border,
    position: "relative",
  },
  roleOptionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  roleOptionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    marginBottom: 4,
    textAlign: "center",
  },
  roleOptionDescription: {
    fontSize: 10,
    color: MedicalColors.textMuted,
    textAlign: "center",
    lineHeight: 14,
  },
  selectedIndicator: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: MedicalColors.inputBorder,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: MedicalColors.inputBackground,
    color: MedicalColors.textPrimary,
  },
  inputError: {
    borderColor: MedicalColors.inputBorderError,
    backgroundColor: "#FFF5F5",
  },
  inputSuccess: {
    borderColor: MedicalColors.inputBorderSuccess,
    backgroundColor: "#F0FFF4",
  },
  errorText: {
    color: MedicalColors.error,
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  helperText: {
    color: MedicalColors.textMuted,
    fontSize: 12,
    marginTop: 4,
    fontStyle: "italic",
  },
  passwordStrength: {
    marginTop: 8,
    alignItems: "flex-end",
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
  },
  registerButton: {
    backgroundColor: MedicalColors.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: MedicalColors.shadowMedium,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  registerButtonDisabled: {
    backgroundColor: MedicalColors.textMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    color: MedicalColors.primary,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    fontWeight: "600",
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: MedicalColors.textMuted,
    textAlign: "center",
  },
});
