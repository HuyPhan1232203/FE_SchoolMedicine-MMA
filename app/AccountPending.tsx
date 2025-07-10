import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { MedicalColors, MedicalIcons, RoleColors } from '../constants/Colors';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../lib/firebase';

interface ApprovalStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  icon: string;
}

export default function AccountPending() {
  const { user } = useAuth();
  const [userRole] = useState<'parent' | 'medical_staff' | 'administrator'>('parent');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Pulse animation for the pending icon
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [fadeAnim, pulseAnim]);

  const getRoleInfo = () => {
    const roleInfo = {
      parent: {
        title: 'Phụ huynh',
        description: 'Tài khoản phụ huynh cần được xác minh',
        icon: RoleColors.parent.icon,
        color: RoleColors.parent.primary,
        approvalMessage: 'Chúng tôi cần xác minh thông tin để đảm bảo bạn là phụ huynh của học sinh tại trường.',
      },
      medical_staff: {
        title: 'Cán bộ Y tế',
        description: 'Tài khoản y tế cần phê duyệt chuyên môn',
        icon: RoleColors.medical_staff.icon,
        color: RoleColors.medical_staff.primary,
        approvalMessage: 'Tài khoản cán bộ y tế cần được phê duyệt để đảm bảo an toàn dữ liệu sức khỏe học sinh.',
      },
      administrator: {
        title: 'Quản lý',
        description: 'Tài khoản quản trị cần phê duyệt cấp cao',
        icon: RoleColors.administrator.icon,
        color: RoleColors.administrator.primary,
        approvalMessage: 'Tài khoản quản lý cần được phê duyệt bởi ban giám hiệu để đảm bảo quyền truy cập hệ thống.',
      },
    };
    return roleInfo[userRole];
  };

  const getApprovalSteps = (): ApprovalStep[] => {
    const baseSteps = [
      {
        id: '1',
        title: 'Đăng ký tài khoản',
        description: 'Tạo tài khoản thành công',
        status: 'completed' as const,
        icon: '✅',
      },
      {
        id: '2',
        title: 'Xác thực email',
        description: 'Email đã được xác thực',
        status: 'completed' as const,
        icon: '📧',
      },
      {
        id: '3',
        title: 'Chờ phê duyệt',
        description: 'Đang chờ quản trị viên phê duyệt',
        status: 'current' as const,
        icon: '⏳',
      },
      {
        id: '4',
        title: 'Kích hoạt tài khoản',
        description: 'Tài khoản sẽ được kích hoạt sau khi phê duyệt',
        status: 'pending' as const,
        icon: '🔓',
      },
    ];

    if (userRole === 'medical_staff') {
      baseSteps.splice(2, 0, {
        id: '2.5',
        title: 'Xác minh chuyên môn',
        description: 'Xác minh bằng cấp y tế',
        status: 'completed' as const,
        icon: '🩺',
      });
    }

    return baseSteps;
  };

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có muốn đăng xuất và quay lại màn hình đăng nhập?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace('/Login');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Liên hệ hỗ trợ',
      'Chọn phương thức liên hệ:',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: '📞 Gọi điện',
          onPress: () => Alert.alert('Hotline', 'Gọi: 0123-456-789\n(8:00 - 17:00, Thứ 2 - Thứ 6)'),
        },
        {
          text: '📧 Gửi email',
          onPress: () => Alert.alert('Email', 'Gửi email đến: support@schoolmedicine.edu.vn'),
        },
      ]
    );
  };

  const handleCheckStatus = async () => {
    setRefreshing(true);
    // Simulate API call to check approval status
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert(
        'Trạng thái tài khoản',
        'Tài khoản của bạn vẫn đang trong quá trình phê duyệt.\n\nThời gian phê duyệt trung bình: 1-2 ngày làm việc.',
        [{ text: 'OK' }]
      );
    }, 2000);
  };

  const getEstimatedTime = () => {
    switch (userRole) {
      case 'parent':
        return '1-2 ngày làm việc';
      case 'medical_staff':
        return '2-3 ngày làm việc';
      case 'administrator':
        return '3-5 ngày làm việc';
      default:
        return '1-3 ngày làm việc';
    }
  };

  const roleInfo = getRoleInfo();
  const approvalSteps = getApprovalSteps();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <Animated.View style={[styles.pendingIconContainer, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.pendingIcon}>⏳</Text>
          </Animated.View>
          <Text style={styles.title}>Tài khoản đang chờ phê duyệt</Text>
          <Text style={styles.subtitle}>
            Cảm ơn bạn đã đăng ký {roleInfo.title}
          </Text>
        </View>

        {/* Role Info Card */}
        <View style={styles.roleCard}>
          <View style={styles.roleHeader}>
            <View style={[styles.roleIconContainer, { backgroundColor: roleInfo.color }]}>
              <Text style={styles.roleIcon}>{roleInfo.icon}</Text>
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleTitle}>{roleInfo.title}</Text>
              <Text style={styles.roleDescription}>{roleInfo.description}</Text>
            </View>
          </View>
          
          <View style={styles.approvalMessage}>
            <Text style={styles.approvalText}>{roleInfo.approvalMessage}</Text>
          </View>
        </View>

        {/* User Information */}
        {user && (
          <View style={styles.userCard}>
            <Text style={styles.sectionTitle}>📋 Thông tin tài khoản</Text>
            <View style={styles.userDetails}>
              <View style={styles.userRow}>
                <Text style={styles.userLabel}>Email:</Text>
                <Text style={styles.userValue}>{user.email}</Text>
              </View>
              <View style={styles.userRow}>
                <Text style={styles.userLabel}>Ngày đăng ký:</Text>
                <Text style={styles.userValue}>
                  {user.metadata.creationTime ? 
                    new Date(user.metadata.creationTime).toLocaleDateString('vi-VN') : 
                    'Không rõ'
                  }
                </Text>
              </View>
              <View style={styles.userRow}>
                <Text style={styles.userLabel}>Trạng thái email:</Text>
                <View style={[styles.statusBadge, user.emailVerified ? styles.verifiedBadge : styles.unverifiedBadge]}>
                  <Text style={[styles.statusText, user.emailVerified ? styles.verifiedText : styles.unverifiedText]}>
                    {user.emailVerified ? "✅ Đã xác minh" : "❌ Chưa xác minh"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Approval Process */}
        <View style={styles.processCard}>
          <Text style={styles.sectionTitle}>🔄 Quy trình phê duyệt</Text>
          <View style={styles.stepsContainer}>
            {approvalSteps.map((step, index) => (
              <View key={step.id} style={styles.stepItem}>
                <View style={styles.stepLeft}>
                  <View style={[
                    styles.stepIconContainer,
                    step.status === 'completed' && styles.stepCompleted,
                    step.status === 'current' && styles.stepCurrent,
                    step.status === 'pending' && styles.stepPending,
                  ]}>
                    <Text style={styles.stepIcon}>{step.icon}</Text>
                  </View>
                  {index < approvalSteps.length - 1 && (
                    <View style={[
                      styles.stepLine,
                      step.status === 'completed' && styles.stepLineCompleted,
                    ]} />
                  )}
                </View>
                <View style={styles.stepContent}>
                  <Text style={[
                    styles.stepTitle,
                    step.status === 'current' && styles.stepTitleCurrent,
                  ]}>
                    {step.title}
                  </Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Estimated Time */}
        <View style={styles.timeCard}>
          <View style={styles.timeHeader}>
            <Text style={styles.timeIcon}>⏰</Text>
            <Text style={styles.timeTitle}>Thời gian phê duyệt dự kiến</Text>
          </View>
          <Text style={styles.timeValue}>{getEstimatedTime()}</Text>
          <Text style={styles.timeNote}>
            Thời gian có thể thay đổi tùy thuộc vào khối lượng công việc và độ phức tạp của việc xác minh.
          </Text>
        </View>

        {/* What happens next */}
        <View style={styles.nextStepsCard}>
          <Text style={styles.sectionTitle}>📋 Tiếp theo sẽ là gì?</Text>
          <View style={styles.nextStepsList}>
            <View style={styles.nextStepItem}>
              <Text style={styles.nextStepIcon}>👨‍💼</Text>
              <Text style={styles.nextStepText}>
                Quản trị viên sẽ xem xét thông tin của bạn
              </Text>
            </View>
            <View style={styles.nextStepItem}>
              <Text style={styles.nextStepIcon}>📧</Text>
              <Text style={styles.nextStepText}>
                Bạn sẽ nhận được email thông báo kết quả
              </Text>
            </View>
            <View style={styles.nextStepItem}>
              <Text style={styles.nextStepIcon}>🎉</Text>
              <Text style={styles.nextStepText}>
                Sau khi được phê duyệt, bạn có thể sử dụng đầy đủ tính năng
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleCheckStatus}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.primaryButtonIcon}>🔄</Text>
                <Text style={styles.primaryButtonText}>Kiểm tra trạng thái</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleContactSupport}
          >
            <Text style={styles.secondaryButtonIcon}>📞</Text>
            <Text style={styles.secondaryButtonText}>Liên hệ hỗ trợ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonIcon}>🚪</Text>
            <Text style={styles.logoutButtonText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Information */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>📞 Thông tin liên hệ</Text>
          <View style={styles.contactList}>
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📧</Text>
              <Text style={styles.contactText}>support@schoolmedicine.edu.vn</Text>
            </View>
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📞</Text>
              <Text style={styles.contactText}>0123-456-789 (8:00 - 17:00)</Text>
            </View>
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>🏥</Text>
              <Text style={styles.contactText}>Phòng Y tế - Trường THCS ABC</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {MedicalIcons.school} Hệ thống School Medicine
          </Text>
          <Text style={styles.footerSubtext}>
            Bảo vệ sức khỏe học sinh - Yên tâm phụ huynh
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MedicalColors.backgroundSecondary,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  pendingIconContainer: {
    marginBottom: 20,
  },
  pendingIcon: {
    fontSize: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: MedicalColors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: MedicalColors.textSecondary,
    textAlign: 'center',
  },
  roleCard: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: MedicalColors.shadowMedium,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  roleIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  roleIcon: {
    fontSize: 24,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: MedicalColors.textPrimary,
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
  },
  approvalMessage: {
    backgroundColor: MedicalColors.backgroundSecondary,
    borderRadius: 8,
    padding: 12,
  },
  approvalText: {
    fontSize: 14,
    color: MedicalColors.textPrimary,
    lineHeight: 20,
  },
  userCard: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: MedicalColors.textPrimary,
    marginBottom: 15,
  },
  userDetails: {
    gap: 12,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userLabel: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    flex: 1,
  },
  userValue: {
    fontSize: 14,
    color: MedicalColors.textPrimary,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedBadge: {
    backgroundColor: MedicalColors.success + '20',
  },
  unverifiedBadge: {
    backgroundColor: MedicalColors.error + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  verifiedText: {
    color: MedicalColors.success,
  },
  unverifiedText: {
    color: MedicalColors.error,
  },
  processCard: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepsContainer: {
    gap: 0,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  stepLeft: {
    alignItems: 'center',
    marginRight: 15,
  },
  stepIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MedicalColors.border,
  },
  stepCompleted: {
    backgroundColor: MedicalColors.success,
  },
  stepCurrent: {
    backgroundColor: MedicalColors.primary,
  },
  stepPending: {
    backgroundColor: MedicalColors.textMuted,
  },
  stepIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  stepLine: {
    width: 2,
    height: 30,
    backgroundColor: MedicalColors.border,
    marginTop: 4,
  },
  stepLineCompleted: {
    backgroundColor: MedicalColors.success,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: MedicalColors.textPrimary,
    marginBottom: 4,
  },
  stepTitleCurrent: {
    color: MedicalColors.primary,
  },
  stepDescription: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
    lineHeight: 16,
  },
  timeCard: {
    backgroundColor: MedicalColors.warning + '10',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: MedicalColors.warning + '30',
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  timeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: MedicalColors.textPrimary,
  },
  timeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: MedicalColors.warning,
    marginBottom: 8,
  },
  timeNote: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  nextStepsCard: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextStepsList: {
    gap: 12,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  nextStepIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  nextStepText: {
    fontSize: 14,
    color: MedicalColors.textPrimary,
    lineHeight: 20,
    flex: 1,
  },
  actionsSection: {
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: MedicalColors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: MedicalColors.shadowMedium,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: MedicalColors.border,
  },
  secondaryButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  secondaryButtonText: {
    color: MedicalColors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: MedicalColors.error,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  contactCard: {
    backgroundColor: MedicalColors.info + '10',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: MedicalColors.info + '30',
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: MedicalColors.textPrimary,
    marginBottom: 15,
  },
  contactList: {
    gap: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIcon: {
    fontSize: 16,
    marginRight: 10,
    width: 20,
  },
  contactText: {
    fontSize: 14,
    color: MedicalColors.textPrimary,
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: MedicalColors.textMuted,
    textAlign: 'center',
  },
}); 