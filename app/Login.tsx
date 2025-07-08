import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ErrorMessage, SuccessMessage } from "../components/ErrorMessage";
import { MedicalColors, MedicalIcons, RoleColors } from "../constants/Colors";
import {
  loginWithRetry,
  resendEmailVerification,
} from "../services/authService";

const { width } = Dimensions.get("window");

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showResendOption, setShowResendOption] = useState(false);
  const router = useRouter();

  // Real-time validation
  useEffect(() => {
    const newErrors: { email?: string; password?: string } = {};

    if (email && !isValidEmail(email)) {
      newErrors.email = "Định dạng email không hợp lệ";
    }

    if (password && password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setErrors(newErrors);
  }, [email, password]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = () => {
    return (
      email.trim() !== "" &&
      password.trim() !== "" &&
      isValidEmail(email) &&
      password.length >= 6 &&
      Object.keys(errors).length === 0
    );
  };

  const handleLogin = async () => {
    if (!isFormValid()) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin hợp lệ");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setShowResendOption(false);

    try {
      await loginWithRetry(email.trim(), password);

      // ✅ Save login time to AsyncStorage for auth persistence
      await AsyncStorage.setItem("loginTime", Date.now().toString());

      setSuccessMessage("Đăng nhập thành công! Đang chuyển hướng...");

      setTimeout(() => {
        router.replace("/(tabs)/Home");
      }, 1000);
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage(error.message);

      // Show resend email option for email verification errors
      if (error.code === "auth/email-not-verified") {
        setShowResendOption(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmailVerification = async () => {
    setResendLoading(true);
    setErrorMessage("");

    try {
      await resendEmailVerification();
      setSuccessMessage(
        "Email xác thực đã được gửi lại! Vui lòng kiểm tra hộp thư."
      );
      setShowResendOption(false);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setResendLoading(false);
    }
  };

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
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>{MedicalIcons.health}</Text>
            <Text style={styles.logoText}>School Medicine</Text>
          </View>
          <Text style={styles.subtitle}>Hệ thống quản lý y tế trường học</Text>
          <Text style={styles.description}>
            Dành cho phụ huynh, cán bộ y tế và ban quản lý
          </Text>
        </View>

        {/* Login Card */}
        <View style={styles.loginCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.title}>Đăng nhập</Text>
            <Text style={styles.welcomeText}>
              Chào mừng bạn trở lại {MedicalIcons.stethoscope}
            </Text>
          </View>

          {/* Role Indicators */}
          <View style={styles.roleIndicators}>
            <View style={styles.roleItem}>
              <Text style={styles.roleIcon}>{RoleColors.parent.icon}</Text>
              <Text style={styles.roleText}>Phụ huynh</Text>
            </View>
            <View style={styles.roleItem}>
              <Text style={styles.roleIcon}>
                {RoleColors.medical_staff.icon}
              </Text>
              <Text style={styles.roleText}>Cán bộ Y tế</Text>
            </View>
            <View style={styles.roleItem}>
              <Text style={styles.roleIcon}>
                {RoleColors.administrator.icon}
              </Text>
              <Text style={styles.roleText}>Quản lý</Text>
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

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{MedicalIcons.info} Email của bạn</Text>
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
          </View>

          {/* Resend Email Verification Option */}
          {showResendOption && (
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Email chưa được xác thực?</Text>
              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendEmailVerification}
                disabled={resendLoading}
              >
                {resendLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={MedicalColors.primary}
                  />
                ) : (
                  <Text style={styles.resendButtonText}>
                    📧 Gửi lại email xác thực
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              !isFormValid() && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading || !isFormValid()}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>🏥 Đăng nhập</Text>
            )}
          </TouchableOpacity>

          {/* Navigation Links */}
          <View style={styles.linksContainer}>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push("/ResetPassword")}
            >
              <Text style={styles.linkText}>🔑 Quên mật khẩu?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => router.push("/Register")}
            >
              <Text style={styles.registerButtonText}>
                {MedicalIcons.family} Đăng ký tài khoản mới
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {MedicalIcons.school} Hệ thống School Medicine {MedicalIcons.health}
          </Text>
          <Text style={styles.footerSubtext}>
            Bảo vệ sức khỏe học sinh - Yên tâm phụ huynh
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
  loginCard: {
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
  },
  roleIndicators: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: MedicalColors.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  roleItem: {
    alignItems: "center",
    flex: 1,
  },
  roleIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 10,
    color: MedicalColors.textSecondary,
    fontWeight: "500",
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
  resendContainer: {
    backgroundColor: "#F8F9FF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  resendText: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    marginBottom: 8,
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: MedicalColors.background,
    borderWidth: 1,
    borderColor: MedicalColors.primary,
  },
  resendButtonText: {
    color: MedicalColors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: MedicalColors.primary,
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
  loginButtonDisabled: {
    backgroundColor: MedicalColors.textMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  linksContainer: {
    alignItems: "center",
  },
  linkButton: {
    marginBottom: 12,
  },
  linkText: {
    color: MedicalColors.accent,
    fontSize: 14,
    fontWeight: "600",
  },
  registerButton: {
    backgroundColor: MedicalColors.secondary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  registerButtonText: {
    color: MedicalColors.textPrimary,
    fontSize: 14,
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
