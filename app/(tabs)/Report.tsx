import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { MedicalColors, MedicalIcons } from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';

const { width } = Dimensions.get('window');

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
  period: string;
}

interface HealthStatistic {
  id: string;
  category: string;
  total: number;
  healthy: number;
  needsAttention: number;
  urgent: number;
  percentage: number;
}

interface RecentReport {
  id: string;
  title: string;
  date: string;
  type: 'monthly' | 'weekly' | 'annual' | 'emergency';
  status: 'completed' | 'pending' | 'draft';
  author: string;
}

export default function Report() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');
  const [userRole, setUserRole] = useState<'parent' | 'medical_staff' | 'administrator'>('medical_staff');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<RecentReport | null>(null);

  // Mock data - would come from backend
  const reportCards: ReportCard[] = [
    {
      id: '1',
      title: 'Khám sức khỏe định kỳ',
      description: 'Tổng số học sinh đã khám',
      icon: MedicalIcons.stethoscope,
      value: '342/350',
      trend: 'up',
      color: MedicalColors.success,
      period: 'Tháng này',
    },
    {
      id: '2',
      title: 'Tiêm chủng đầy đủ',
      description: 'Học sinh hoàn thành tiêm chủng',
      icon: MedicalIcons.syringe,
      value: '95.2%',
      trend: 'up',
      color: MedicalColors.primary,
      period: 'Năm học 2024',
    },
    {
      id: '3',
      title: 'Trường hợp cần theo dõi',
      description: 'Học sinh cần chăm sóc đặc biệt',
      icon: MedicalIcons.warning,
      value: '23',
      trend: 'down',
      color: MedicalColors.warning,
      period: 'Hiện tại',
    },
    {
      id: '4',
      title: 'Tình huống khẩn cấp',
      description: 'Sự cố y tế trong tháng',
      icon: MedicalIcons.alert,
      value: '2',
      trend: 'stable',
      color: MedicalColors.error,
      period: 'Tháng này',
    },
  ];

  const healthStatistics: HealthStatistic[] = [
    {
      id: '1',
      category: 'Khối 6',
      total: 120,
      healthy: 115,
      needsAttention: 4,
      urgent: 1,
      percentage: 95.8,
    },
    {
      id: '2',
      category: 'Khối 7',
      total: 118,
      healthy: 110,
      needsAttention: 6,
      urgent: 2,
      percentage: 93.2,
    },
    {
      id: '3',
      category: 'Khối 8',
      total: 112,
      healthy: 105,
      needsAttention: 5,
      urgent: 2,
      percentage: 93.8,
    },
  ];

  const recentReports: RecentReport[] = [
    {
      id: '1',
      title: 'Báo cáo sức khỏe tháng 11/2024',
      date: '30/11/2024',
      type: 'monthly',
      status: 'completed',
      author: 'BS. Nguyễn Thị Lan',
    },
    {
      id: '2',
      title: 'Thống kê tiêm chủng quý IV',
      date: '25/11/2024',
      type: 'monthly',
      status: 'pending',
      author: 'Y tá Trần Văn Nam',
    },
    {
      id: '3',
      title: 'Báo cáo sự cố y tế tuần',
      date: '22/11/2024',
      type: 'weekly',
      status: 'completed',
      author: 'Trưởng phòng Y tế',
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➖';
      default: return '➖';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return MedicalColors.success;
      case 'pending': return MedicalColors.warning;
      case 'draft': return MedicalColors.textMuted;
      default: return MedicalColors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'pending': return 'Đang xử lý';
      case 'draft': return 'Nháp';
      default: return 'Không xác định';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'monthly': return '📅';
      case 'weekly': return '📋';
      case 'annual': return '📊';
      case 'emergency': return '🚨';
      default: return '📄';
    }
  };

  const generateReport = (type: 'health' | 'vaccination' | 'emergency' | 'comprehensive') => {
    const reportTypes = {
      health: 'Báo cáo sức khỏe tổng quát',
      vaccination: 'Báo cáo tiêm chủng',
      emergency: 'Báo cáo sự cố y tế',
      comprehensive: 'Báo cáo tổng hợp',
    };
    
    Alert.alert(
      'Tạo báo cáo',
      `Đang tạo ${reportTypes[type]}...`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Tiếp tục', onPress: () => {
          Alert.alert('Thành công', 'Báo cáo đã được tạo và lưu vào hệ thống');
        }}
      ]
    );
  };

  const openReportDetail = (report: RecentReport) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const getRoleBasedActions = () => {
    switch (userRole) {
      case 'parent':
        return [
          {
            title: 'Báo cáo sức khỏe con em',
            description: 'Xem chi tiết sức khỏe',
            icon: MedicalIcons.family,
            action: () => generateReport('health'),
          },
        ];
      case 'medical_staff':
        return [
          {
            title: 'Báo cáo sức khỏe',
            description: 'Tạo báo cáo tổng quát',
            icon: MedicalIcons.stethoscope,
            action: () => generateReport('health'),
          },
          {
            title: 'Báo cáo tiêm chủng',
            description: 'Thống kê tiêm chủng',
            icon: MedicalIcons.syringe,
            action: () => generateReport('vaccination'),
          },
          {
            title: 'Báo cáo sự cố',
            description: 'Ghi nhận sự cố y tế',
            icon: MedicalIcons.alert,
            action: () => generateReport('emergency'),
          },
        ];
      case 'administrator':
        return [
          {
            title: 'Báo cáo tổng hợp',
            description: 'Báo cáo đầy đủ toàn trường',
            icon: MedicalIcons.report,
            action: () => generateReport('comprehensive'),
          },
          {
            title: 'Thống kê y tế',
            description: 'Phân tích dữ liệu sức khỏe',
            icon: '📊',
            action: () => Alert.alert('Thống kê', 'Đang chuẩn bị báo cáo thống kê...'),
          },
        ];
      default:
        return [];
    }
  };

  const roleActions = getRoleBasedActions();

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {MedicalIcons.report} Báo cáo Y tế
          </Text>
          <Text style={styles.headerSubtitle}>
            Theo dõi và phân tích sức khỏe học sinh
          </Text>
        </View>
      </View>

      {/* Period Filter */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thời gian báo cáo</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.periodFilter}>
            {[
              { key: 'this_week', label: 'Tuần này' },
              { key: 'this_month', label: 'Tháng này' },
              { key: 'this_quarter', label: 'Quý này' },
              { key: 'this_year', label: 'Năm này' },
            ].map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.key && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod(period.key)}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period.key && styles.periodButtonTextActive
                ]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Report Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          📊 Tổng quan chỉ số
        </Text>
        <View style={styles.cardsGrid}>
          {reportCards.map((card) => (
            <View key={card.id} style={styles.reportCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>{card.icon}</Text>
                <Text style={styles.cardTrend}>
                  {getTrendIcon(card.trend)}
                </Text>
              </View>
              <Text style={[styles.cardValue, { color: card.color }]}>
                {card.value}
              </Text>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardDescription}>{card.description}</Text>
              <Text style={styles.cardPeriod}>{card.period}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Health Statistics by Grade */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          📈 Thống kê theo khối lớp
        </Text>
        <View style={styles.statisticsContainer}>
          {healthStatistics.map((stat) => (
            <View key={stat.id} style={styles.statisticCard}>
              <View style={styles.statisticHeader}>
                <Text style={styles.statisticCategory}>{stat.category}</Text>
                <Text style={[styles.statisticPercentage, 
                  { color: stat.percentage >= 95 ? MedicalColors.success : 
                           stat.percentage >= 90 ? MedicalColors.warning : MedicalColors.error }
                ]}>
                  {stat.percentage}%
                </Text>
              </View>
              
              <View style={styles.statisticDetails}>
                <View style={styles.statisticItem}>
                  <View style={[styles.statusDot, { backgroundColor: MedicalColors.success }]} />
                  <Text style={styles.statusText}>Khỏe mạnh: {stat.healthy}</Text>
                </View>
                <View style={styles.statisticItem}>
                  <View style={[styles.statusDot, { backgroundColor: MedicalColors.warning }]} />
                  <Text style={styles.statusText}>Cần theo dõi: {stat.needsAttention}</Text>
                </View>
                <View style={styles.statisticItem}>
                  <View style={[styles.statusDot, { backgroundColor: MedicalColors.error }]} />
                  <Text style={styles.statusText}>Khẩn cấp: {stat.urgent}</Text>
                </View>
              </View>
              
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${stat.percentage}%`,
                      backgroundColor: stat.percentage >= 95 ? MedicalColors.success : 
                                     stat.percentage >= 90 ? MedicalColors.warning : MedicalColors.error
                    }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Report Generation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          ⚡ Tạo báo cáo nhanh
        </Text>
        <View style={styles.actionsGrid}>
          {roleActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={action.action}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Reports */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          📋 Báo cáo gần đây
        </Text>
        <View style={styles.reportsContainer}>
          {recentReports.map((report) => (
            <TouchableOpacity
              key={report.id}
              style={styles.reportItem}
              onPress={() => openReportDetail(report)}
            >
              <View style={styles.reportIconContainer}>
                <Text style={styles.reportTypeIcon}>{getTypeIcon(report.type)}</Text>
              </View>
              <View style={styles.reportContent}>
                <Text style={styles.reportTitle}>{report.title}</Text>
                <Text style={styles.reportAuthor}>Tác giả: {report.author}</Text>
                <Text style={styles.reportDate}>{report.date}</Text>
              </View>
              <View style={styles.reportStatus}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
                  <Text style={styles.statusBadgeText}>{getStatusText(report.status)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Report Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chi tiết báo cáo</Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowDetailModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {selectedReport && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Tiêu đề:</Text>
                <Text style={styles.modalValue}>{selectedReport.title}</Text>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Ngày tạo:</Text>
                <Text style={styles.modalValue}>{selectedReport.date}</Text>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Tác giả:</Text>
                <Text style={styles.modalValue}>{selectedReport.author}</Text>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Trạng thái:</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedReport.status) }]}>
                  <Text style={styles.statusBadgeText}>{getStatusText(selectedReport.status)}</Text>
                </View>
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalActionButton}>
                  <Text style={styles.modalActionText}>📄 Xem chi tiết</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalActionButton}>
                  <Text style={styles.modalActionText}>📤 Xuất file</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalActionButton}>
                  <Text style={styles.modalActionText}>📧 Chia sẻ</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: MedicalColors.textPrimary,
    marginBottom: 15,
  },
  periodFilter: {
    flexDirection: 'row',
    gap: 10,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: MedicalColors.backgroundCard,
    borderWidth: 2,
    borderColor: MedicalColors.border,
  },
  periodButtonActive: {
    backgroundColor: MedicalColors.primary,
    borderColor: MedicalColors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  reportCard: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 12,
    padding: 15,
    width: (width - 60) / 2,
    marginBottom: 15,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardTrend: {
    fontSize: 16,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: MedicalColors.textPrimary,
    marginBottom: 3,
  },
  cardDescription: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
    marginBottom: 5,
  },
  cardPeriod: {
    fontSize: 10,
    color: MedicalColors.textMuted,
    fontStyle: 'italic',
  },
  statisticsContainer: {
    gap: 15,
  },
  statisticCard: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statisticHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statisticCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    color: MedicalColors.textPrimary,
  },
  statisticPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statisticDetails: {
    gap: 8,
    marginBottom: 12,
  },
  statisticItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: MedicalColors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MedicalColors.textPrimary,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
  },
  actionArrow: {
    fontSize: 18,
    color: MedicalColors.textMuted,
  },
  reportsContainer: {
    gap: 12,
  },
  reportItem: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MedicalColors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  reportTypeIcon: {
    fontSize: 20,
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MedicalColors.textPrimary,
    marginBottom: 4,
  },
  reportAuthor: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
    marginBottom: 2,
  },
  reportDate: {
    fontSize: 12,
    color: MedicalColors.textMuted,
  },
  reportStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: MedicalColors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: MedicalColors.primary,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: MedicalColors.textSecondary,
    marginBottom: 8,
  },
  modalValue: {
    fontSize: 16,
    color: MedicalColors.textPrimary,
  },
  modalActions: {
    gap: 12,
    marginTop: 20,
  },
  modalActionButton: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: MedicalColors.border,
  },
  modalActionText: {
    fontSize: 16,
    color: MedicalColors.textPrimary,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
});
