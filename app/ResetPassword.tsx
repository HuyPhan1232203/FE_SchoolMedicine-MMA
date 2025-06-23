import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ErrorMessage, SuccessMessage } from "../components/ErrorMessage";
import { resetPassword } from "../services/authService";

const { width } = Dimensions.get('window');

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    general: ""
  });
  const [generalErrorType, setGeneralErrorType] = useState<'auth' | 'network' | 'validation' | 'unknown'>('unknown');
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return "Email không được để trống";
    }
    if (!emailRegex.test(email.trim())) {
      return "Email không đúng định dạng";
    }
    return "";
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setErrors(prev => ({
      ...prev,
      email: validateEmail(text),
      general: ""
    }));
    setSuccessMessage("");
  };

  const isFormValid = () => {
    const emailError = validateEmail(email);
    return !emailError;
  };

  const handleResetPassword = async () => {
    // Validate email
    const emailError = validateEmail(email);

    setErrors({
      email: emailError,
      general: ""
    });

    if (emailError) {
      return;
    }

    setLoading(true);
    setSuccessMessage("");
    
    try {
      await resetPassword(email.trim());
      
      // Show success message
      setSuccessMessage(
        "Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn (kể cả thư mục spam)."
      );
      setErrors({ email: "", general: "" });
      
      // Tự động quay lại Login sau 5 giây
      setTimeout(() => {
        router.back();
      }, 5000);
      
    } catch (error: any) {
      console.error('Reset password error:', error);
      
      // Determine error type for better UI display
      let errorType: 'auth' | 'network' | 'validation' | 'unknown' = 'auth';
      const errorMessage = error.message || 'Có lỗi xảy ra khi gửi email đặt lại mật khẩu!';
      
      if (errorMessage.includes('mạng') || errorMessage.includes('kết nối')) {
        errorType = 'network';
      } else if (errorMessage.includes('không tìm thấy') || errorMessage.includes('không tồn tại')) {
        errorType = 'validation';
      }
      
      setGeneralErrorType(errorType);
      setErrors(prev => ({
        ...prev,
        general: errorMessage
      }));
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setErrors(prev => ({ ...prev, general: "" }));
    setSuccessMessage("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.resetCard}>
        <View style={styles.header}>
          <Text style={styles.title}>Đặt lại mật khẩu 🔑</Text>
          <Text style={styles.subtitle}>
            Nhập email để nhận liên kết đặt lại mật khẩu
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[
                styles.input,
                errors.email ? styles.inputError : null,
                successMessage ? styles.inputSuccess : null
              ]}
              placeholder="Nhập email của bạn"
              placeholderTextColor="#999"
              value={email}
              onChangeText={handleEmailChange}
              autoCapitalize="none"
              keyboardType="email-address"
              autoFocus
            />
            {errors.email ? (
              <Text style={styles.errorText}>⚠️ {errors.email}</Text>
            ) : null}
          </View>

          {/* Enhanced error display */}
          <ErrorMessage 
            error={errors.general}
            type={generalErrorType}
            onDismiss={clearMessages}
          />

          {/* Success message */}
          <SuccessMessage 
            message={successMessage}
            onDismiss={() => setSuccessMessage("")}
          />

          {successMessage && (
            <View style={styles.redirectInfo}>
              <Text style={styles.redirectText}>
                ⏰ Tự động quay lại đăng nhập sau 5 giây...
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.resetButton, 
              (loading || !isFormValid() || successMessage) && styles.resetButtonDisabled
            ]}
            onPress={handleResetPassword}
            disabled={loading || !isFormValid() || !!successMessage}
          >
            <Text style={styles.resetButtonText}>
              {loading ? "Đang gửi..." : "Gửi email đặt lại mật khẩu"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Quay lại đăng nhập</Text>
          </TouchableOpacity>

          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>💡 Lưu ý:</Text>
            <Text style={styles.helpText}>• Kiểm tra thư mục Spam nếu không thấy email</Text>
            <Text style={styles.helpText}>• Link đặt lại mật khẩu có hiệu lực trong 1 giờ</Text>
            <Text style={styles.helpText}>• Nếu không nhận được email, thử gửi lại</Text>
            <Text style={styles.helpText}>• Email có thể mất 1-2 phút để đến hộp thư</Text>
          </View>
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
    backgroundColor: '#f8f9fa'
  },
  resetCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: width * 0.9,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: '#2c3e50',
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: '#7f8c8d',
    lineHeight: 22,
  },
  formContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: { 
    borderWidth: 2, 
    borderColor: "#e1e8ed", 
    borderRadius: 12, 
    padding: 16, 
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#2c3e50',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 2,
  },
  inputSuccess: {
    borderColor: '#27ae60',
    borderWidth: 2,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  redirectInfo: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  redirectText: {
    color: '#2d5a2d',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  resetButton: {
    backgroundColor: '#e67e22',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#e67e22',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  resetButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
    paddingTop: 20,
  },
  backButton: {
    alignItems: "center",
    marginBottom: 20,
  },
  backButtonText: {
    color: "#3498db",
    fontSize: 16,
    fontWeight: '500',
  },
  helpContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
    lineHeight: 18,
  },
}); 