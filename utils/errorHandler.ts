export interface AuthError {
  code: string;
  message: string;
  userMessage: string;
  type: 'auth' | 'network' | 'validation' | 'unknown';
}

export class AuthErrorHandler {
  private static errorMap: Record<string, string> = {
    // Authentication Errors
    'auth/user-not-found': 'Tài khoản không tồn tại. Vui lòng kiểm tra lại email hoặc đăng ký tài khoản mới.',
    'auth/wrong-password': 'Mật khẩu không đúng. Vui lòng thử lại hoặc đặt lại mật khẩu.',
    'auth/invalid-email': 'Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại định dạng email.',
    'auth/user-disabled': 'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ.',
    'auth/email-already-in-use': 'Email này đã được sử dụng cho tài khoản khác. Vui lòng sử dụng email khác hoặc đăng nhập.',
    'auth/weak-password': 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn (ít nhất 6 ký tự).',
    'auth/operation-not-allowed': 'Phương thức đăng nhập này chưa được kích hoạt. Vui lòng liên hệ hỗ trợ.',
    
    // Email Verification Errors
    'auth/invalid-action-code': 'Mã xác minh không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu gửi lại email xác minh.',
    'auth/expired-action-code': 'Mã xác minh đã hết hạn. Vui lòng yêu cầu gửi lại email xác minh.',
    'auth/user-token-expired': 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    
    // Rate Limiting
    'auth/too-many-requests': 'Quá nhiều lần thử đăng nhập. Vui lòng đợi một lúc rồi thử lại.',
    'auth/quota-exceeded': 'Đã vượt quá giới hạn yêu cầu. Vui lòng thử lại sau.',
    
    // Password Reset Errors
    'auth/missing-email': 'Vui lòng nhập địa chỉ email.',
    'auth/invalid-recipient-email': 'Địa chỉ email nhận không hợp lệ.',
    'auth/missing-continue-uri': 'Thiếu URL tiếp tục trong yêu cầu.',
    
    // Network Errors
    'auth/network-request-failed': 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.',
    'auth/timeout': 'Kết nối quá chậm. Vui lòng thử lại.',
    
    // Custom App Errors
    'auth/email-not-verified': 'Vui lòng xác minh email trước khi đăng nhập. Kiểm tra hộp thư của bạn.',
    'auth/account-not-approved': 'Tài khoản chưa được duyệt bởi quản trị viên. Vui lòng đợi phê duyệt.',
    'auth/registration-disabled': 'Đăng ký tài khoản tạm thời bị tắt. Vui lòng thử lại sau.',
    
    // OTP/SMS Errors (for future use)
    'auth/invalid-phone-number': 'Số điện thoại không hợp lệ.',
    'auth/invalid-verification-code': 'Mã OTP không đúng. Vui lòng kiểm tra lại.',
    'auth/code-expired': 'Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại.',
    'auth/session-expired': 'Phiên xác minh đã hết hạn. Vui lòng thử lại.',
    'auth/maximum-second-factor-count-exceeded': 'Đã vượt quá số lần thử mã OTP. Vui lòng thử lại sau.',
    'auth/second-factor-already-in-use': 'Phương thức xác minh này đã được sử dụng.',
    'auth/unsupported-first-factor': 'Phương thức đăng nhập chính không được hỗ trợ.',
    
    // Generic Errors
    'auth/internal-error': 'Lỗi hệ thống. Vui lòng thử lại sau.',
    'auth/app-deleted': 'Ứng dụng đã bị xóa. Vui lòng cài đặt lại.',
    'auth/app-not-authorized': 'Ứng dụng không được phép truy cập. Vui lòng liên hệ hỗ trợ.',
    'auth/argument-error': 'Thông tin không hợp lệ. Vui lòng kiểm tra lại.',
    'auth/invalid-api-key': 'Khóa API không hợp lệ. Vui lòng liên hệ hỗ trợ.',
    'auth/invalid-user-token': 'Token người dùng không hợp lệ. Vui lòng đăng nhập lại.',
    'auth/invalid-tenant-id': 'ID tenant không hợp lệ.',
    'auth/user-mismatch': 'Thông tin người dùng không khớp.',
    
    // Credential Errors
    'auth/credential-already-in-use': 'Thông tin đăng nhập đã được sử dụng bởi tài khoản khác.',
    'auth/custom-token-mismatch': 'Token tùy chỉnh không khớp.',
    'auth/requires-recent-login': 'Thao tác này yêu cầu đăng nhập gần đây. Vui lòng đăng nhập lại.',
  };

  private static getErrorType(code: string): AuthError['type'] {
    if (code.includes('network') || code.includes('timeout')) return 'network';
    if (code.includes('invalid') || code.includes('missing')) return 'validation';
    if (code.startsWith('auth/')) return 'auth';
    return 'unknown';
  }

  static handleError(error: any): AuthError {
    const code = error?.code || 'unknown';
    const originalMessage = error?.message || 'Có lỗi không xác định xảy ra';
    
    // Get user-friendly message
    const userMessage = this.errorMap[code] || this.getGenericMessage(code, originalMessage);
    
    return {
      code,
      message: originalMessage,
      userMessage,
      type: this.getErrorType(code)
    };
  }

  private static getGenericMessage(code: string, originalMessage: string): string {
    // Try to extract meaningful info from original message
    if (originalMessage.toLowerCase().includes('network')) {
      return 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.';
    }
    
    if (originalMessage.toLowerCase().includes('timeout')) {
      return 'Kết nối quá chậm. Vui lòng thử lại sau.';
    }
    
    if (originalMessage.toLowerCase().includes('permission')) {
      return 'Không có quyền thực hiện thao tác này. Vui lòng liên hệ hỗ trợ.';
    }
    
    if (originalMessage.toLowerCase().includes('quota')) {
      return 'Đã vượt quá giới hạn sử dụng. Vui lòng thử lại sau.';
    }
    
    // Default message for unknown errors
    return `Có lỗi xảy ra: ${originalMessage}. Vui lòng thử lại hoặc liên hệ hỗ trợ.`;
  }

  static getErrorIcon(type: AuthError['type']): string {
    switch (type) {
      case 'auth': return '🔐';
      case 'network': return '📶';
      case 'validation': return '⚠️';
      default: return '❌';
    }
  }

  static getErrorColor(type: AuthError['type']): string {
    switch (type) {
      case 'auth': return '#e74c3c';
      case 'network': return '#f39c12';
      case 'validation': return '#e67e22';
      default: return '#95a5a6';
    }
  }
}

// Helper function để sử dụng trong components
export const handleAuthError = (error: any): string => {
  const authError = AuthErrorHandler.handleError(error);
  return authError.userMessage;
};

// Helper function để log errors (for debugging)
export const logAuthError = (error: any, context: string) => {
  const authError = AuthErrorHandler.handleError(error);
  console.error(`[${context}] Auth Error:`, {
    code: authError.code,
    type: authError.type,
    userMessage: authError.userMessage,
    originalMessage: authError.message
  });
}; 