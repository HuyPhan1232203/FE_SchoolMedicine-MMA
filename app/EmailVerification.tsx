import { router, useLocalSearchParams } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../lib/firebase";
import { resendEmailVerification } from "../services/authService";

const { width } = Dimensions.get("window");

export default function EmailVerification() {
  const [loading, setLoading] = useState(false);
  const [checkingLoading, setCheckingLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({
    general: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [lastResendTime, setLastResendTime] = useState(0);
  const params = useLocalSearchParams();

  useEffect(() => {
    // Lấy email từ params hoặc từ user hiện tại
    if (params.email) {
      setEmail(params.email as string);
    }

    // Theo dõi trạng thái xác minh email
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        setSuccessMessage("Email đã được xác minh thành công! 🎉");
        setErrors({ general: "" });

        // Đăng xuất user để họ đăng nhập lại với email đã verified
        signOut(auth);

        setTimeout(() => {
          Alert.alert(
            "Xác minh thành công! 🎉",
            "Email của bạn đã được xác minh. Vui lòng đăng nhập lại để sử dụng hệ thống.",
            [
              {
                text: "Đăng nhập lại",
                onPress: () => router.replace("/Login"),
              },
            ]
          );
        }, 1000);
      }
    });

    return unsubscribe;
  }, [params.email, router]);

  const canResendEmail = () => {
    const now = Date.now();
    const timeDiff = (now - lastResendTime) / 1000; // seconds
    return timeDiff >= 60; // Can resend after 60 seconds
  };

  const getResendCooldown = () => {
    const now = Date.now();
    const timeDiff = (now - lastResendTime) / 1000;
    const remaining = Math.max(0, 60 - Math.floor(timeDiff));
    return remaining;
  };

  const handleResendVerification = async () => {
    if (!canResendEmail()) {
      const remaining = getResendCooldown();
      setErrors({
        general: `Vui lòng đợi ${remaining} giây trước khi gửi lại email.`,
      });
      return;
    }

    setLoading(true);
    setErrors({ general: "" });
    setSuccessMessage("");

    try {
      await resendEmailVerification();
      setLastResendTime(Date.now());
      setSuccessMessage(
        "Email xác minh đã được gửi lại! Vui lòng kiểm tra hộp thư của bạn (kể cả thư mục spam)."
      );
    } catch (error: any) {
      setErrors({
        general: error.message || "Không thể gửi email xác minh!",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    Alert.alert(
      "Xác nhận quay lại",
      "Bạn có chắc chắn muốn quay lại đăng nhập? Tài khoản vẫn cần được xác minh trước khi sử dụng.",
      [
        {
          text: "Ở lại",
          style: "cancel",
        },
        {
          text: "Quay lại",
          onPress: () => {
            // Đăng xuất user hiện tại và quay về login
            signOut(auth);
            router.replace("/Login");
          },
        },
      ]
    );
  };

  const handleCheckVerification = async () => {
    setCheckingLoading(true);
    setErrors({ general: "" });

    try {
      // Reload user để cập nhật trạng thái emailVerified
      await auth.currentUser?.reload();
      const user = auth.currentUser;

      if (user?.emailVerified) {
        setSuccessMessage("Email đã được xác minh thành công! 🎉");

        // Đăng xuất để họ đăng nhập lại với email đã verified
        signOut(auth);

        setTimeout(() => {
          Alert.alert(
            "Xác minh thành công! 🎉",
            "Email của bạn đã được xác minh. Vui lòng đăng nhập lại để sử dụng hệ thống.",
            [
              {
                text: "Đăng nhập lại",
                onPress: () => router.replace("/Login"),
              },
            ]
          );
        }, 1000);
      } else {
        setErrors({
          general:
            "Email chưa được xác minh. Vui lòng kiểm tra hộp thư và click vào link xác minh.",
        });
      }
    } catch (error) {
      setErrors({
        general: "Không thể kiểm tra trạng thái xác minh. Vui lòng thử lại.",
      });
    } finally {
      setCheckingLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.verificationCard}>
        <View style={styles.header}>
          <Text style={styles.icon}>📧</Text>
          <Text style={styles.title}>Xác minh email</Text>
          <Text style={styles.subtitle}>
            Chúng tôi đã gửi email xác minh đến
          </Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        <View style={styles.instructionContainer}>
          <Text style={styles.instructionTitle}>Hướng dẫn:</Text>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1.</Text>
            <Text style={styles.stepText}>Mở ứng dụng email của bạn</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2.</Text>
            <Text style={styles.stepText}>
              Tìm email từ School Medicine MMA
            </Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3.</Text>
            <Text style={styles.stepText}>Click vào link xác minh email</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>4.</Text>
            <Text style={styles.stepText}>Quay lại ứng dụng và đăng nhập</Text>
          </View>
        </View>

        {successMessage ? (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>✅ {successMessage}</Text>
          </View>
        ) : null}

        {errors.general ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ {errors.general}</Text>
          </View>
        ) : null}

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.checkButton,
              (checkingLoading || successMessage) && styles.buttonDisabled,
            ]}
            onPress={handleCheckVerification}
            disabled={checkingLoading || !!successMessage}
          >
            <Text style={styles.checkButtonText}>
              {checkingLoading ? "Đang kiểm tra..." : "✅ Tôi đã xác minh"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.resendButton,
              (loading || !canResendEmail() || successMessage) &&
                styles.buttonDisabled,
            ]}
            onPress={handleResendVerification}
            disabled={loading || !canResendEmail() || !!successMessage}
          >
            <Text style={styles.resendButtonText}>
              {loading
                ? "Đang gửi..."
                : !canResendEmail()
                ? `📤 Gửi lại (${getResendCooldown()}s)`
                : "📤 Gửi lại email"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToLogin}
          >
            <Text style={styles.backButtonText}>← Quay lại đăng nhập</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 Tip: Kiểm tra thư mục Spam nếu không thấy email
          </Text>
          <Text style={styles.footerText}>
            ⏰ Email có thể mất 1-2 phút để đến hộp thư
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  verificationCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    width: width * 0.9,
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  icon: {
    fontSize: 60,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3498db",
    textAlign: "center",
  },
  instructionContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 15,
  },
  step: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3498db",
    width: 20,
  },
  stepText: {
    fontSize: 14,
    color: "#2c3e50",
    flex: 1,
    lineHeight: 20,
  },
  successContainer: {
    backgroundColor: "#d4edda",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#27ae60",
  },
  successText: {
    color: "#155724",
    fontSize: 14,
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#e74c3c",
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
    textAlign: "center",
  },
  actionContainer: {
    marginBottom: 20,
  },
  checkButton: {
    backgroundColor: "#27ae60",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#27ae60",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  checkButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  resendButton: {
    backgroundColor: "#f39c12",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#f39c12",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  resendButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
  backButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  backButtonText: {
    color: "#3498db",
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#e1e8ed",
    paddingTop: 15,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#95a5a6",
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 4,
  },
});
