import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AuthErrorHandler } from '../utils/errorHandler';

interface ErrorMessageProps {
  error: string;
  onDismiss?: () => void;
  type?: 'auth' | 'network' | 'validation' | 'unknown';
  autoHide?: boolean;
  autoHideDelay?: number;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onDismiss,
  type = 'unknown',
  autoHide = false,
  autoHideDelay = 5000
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (error) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();

      // Auto hide if enabled
      if (autoHide && autoHideDelay > 0) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, autoHideDelay);

        return () => clearTimeout(timer);
      }
    }
  }, [error, autoHide, autoHideDelay]);

  const handleDismiss = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      onDismiss?.();
    });
  };

  if (!error) return null;

  // Determine error type from message content if not provided
  const errorType = type || getErrorTypeFromMessage(error);
  const icon = AuthErrorHandler.getErrorIcon(errorType);
  const color = AuthErrorHandler.getErrorColor(errorType);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          borderLeftColor: color,
          backgroundColor: getBackgroundColor(errorType),
        }
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.message, { color: getTextColor(errorType) }]}>
          {error}
        </Text>
        {onDismiss && (
          <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
            <Text style={[styles.closeText, { color: getTextColor(errorType) }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

// Helper function to determine error type from message content
function getErrorTypeFromMessage(message: string): 'auth' | 'network' | 'validation' | 'unknown' {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('mạng') || lowerMessage.includes('kết nối') || lowerMessage.includes('internet')) {
    return 'network';
  }
  
  if (lowerMessage.includes('không hợp lệ') || lowerMessage.includes('định dạng') || lowerMessage.includes('trống')) {
    return 'validation';
  }
  
  if (lowerMessage.includes('đăng nhập') || lowerMessage.includes('mật khẩu') || lowerMessage.includes('email') || lowerMessage.includes('tài khoản')) {
    return 'auth';
  }
  
  return 'unknown';
}

function getBackgroundColor(type: 'auth' | 'network' | 'validation' | 'unknown'): string {
  switch (type) {
    case 'auth': return '#ffebee';      // Light red
    case 'network': return '#fff3e0';   // Light orange
    case 'validation': return '#fff8e1'; // Light amber
    default: return '#f5f5f5';          // Light gray
  }
}

function getTextColor(type: 'auth' | 'network' | 'validation' | 'unknown'): string {
  switch (type) {
    case 'auth': return '#c62828';      // Dark red
    case 'network': return '#e65100';   // Dark orange
    case 'validation': return '#ff8f00'; // Dark amber
    default: return '#424242';          // Dark gray
  }
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
  closeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

// Compact inline error component
export const InlineError: React.FC<{ error?: string; type?: 'auth' | 'network' | 'validation' | 'unknown' }> = ({ 
  error, 
  type = 'validation' 
}) => {
  if (!error) return null;

  const icon = AuthErrorHandler.getErrorIcon(type);
  const color = AuthErrorHandler.getErrorColor(type);

  return (
    <View style={inlineStyles.container}>
      <Text style={[inlineStyles.text, { color }]}>
        {icon} {error}
      </Text>
    </View>
  );
};

const inlineStyles = StyleSheet.create({
  container: {
    marginTop: 5,
    marginLeft: 5,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});

// Success message component
export const SuccessMessage: React.FC<{ message: string; onDismiss?: () => void }> = ({ 
  message, 
  onDismiss 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [message]);

  const handleDismiss = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDismiss?.();
    });
  };

  if (!message) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          borderLeftColor: '#27ae60',
          backgroundColor: '#d4edda',
        }
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>✅</Text>
        <Text style={[styles.message, { color: '#155724' }]}>
          {message}
        </Text>
        {onDismiss && (
          <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
            <Text style={[styles.closeText, { color: '#155724' }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}; 