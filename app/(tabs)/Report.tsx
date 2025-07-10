import { useEffect, useState } from "react";
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
} from "react-native";
import CustomHeader from "../../components/CustomHeader";
import { MedicalColors, MedicalIcons } from "../../constants/Colors";
import { useAuth } from "../../hooks/useAuth";

const { width } = Dimensions.get("window");

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  value: string;
  trend: "up" | "down" | "stable";
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
  type: "monthly" | "weekly" | "annual" | "emergency";
  status: "completed" | "pending" | "draft";
  author: string;
}

export default function Report() {
  const { userProfile } = useAuth();

  useEffect(() => {
    if (userProfile && userProfile.role === "administrator") {
      // Redirect to Dashboard if user is an administrator
      // This logic is now handled by the CustomHeader component
    }
  }, [userProfile]);

  const [refreshing, setRefreshing] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<RecentReport | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<
    "overview" | "statistics" | "reports"
  >("overview");

  const userRole = userProfile?.role || "parent";

  // Mock data - would come from backend
  const reportCards: ReportCard[] = [
    {
      id: "1",
      title: "Khám sức khỏe định kỳ",
      description: "Tổng số học sinh đã khám",
      icon: MedicalIcons.stethoscope,
      value: "342/350",
      trend: "up",
      color: MedicalColors.success,
      period: "Tháng này",
    },
    {
      id: "2",
      title: "Tiêm chủng đầy đủ",
      description: "Học sinh hoàn thành tiêm chủng",
      icon: MedicalIcons.syringe,
      value: "95.2%",
      trend: "up",
      color: MedicalColors.primary,
      period: "Năm học 2024",
    },
    {
      id: "3",
      title: "Trường hợp cần theo dõi",
      description: "Học sinh cần chăm sóc đặc biệt",
      icon: MedicalIcons.warning,
      value: "23",
      trend: "down",
      color: MedicalColors.warning,
      period: "Hiện tại",
    },
    {
      id: "4",
      title: "Tình huống khẩn cấp",
      description: "Sự cố y tế trong tháng",
      icon: MedicalIcons.alert,
      value: "2",
      trend: "stable",
      color: MedicalColors.error,
      period: "Tháng này",
    },
  ];

  const healthStatistics: HealthStatistic[] = [
    {
      id: "1",
      category: "Khối 10",
      total: 120,
      healthy: 115,
      needsAttention: 4,
      urgent: 1,
      percentage: 95.8,
    },
    {
      id: "2",
      category: "Khối 11",
      total: 118,
      healthy: 110,
      needsAttention: 6,
      urgent: 2,
      percentage: 93.2,
    },
    {
      id: "3",
      category: "Khối 12",
      total: 112,
      healthy: 105,
      needsAttention: 5,
      urgent: 2,
      percentage: 93.8,
    },
  ];

  const recentReports: RecentReport[] = [
    {
      id: "1",
      title: "Báo cáo sức khỏe tháng 12/2024",
      date: "30/12/2024",
      type: "monthly",
      status: "completed",
      author: "BS. Nguyễn Thị Lan",
    },
    {
      id: "2",
      title: "Thống kê tiêm chủng quý IV",
      date: "25/12/2024",
      type: "monthly",
      status: "pending",
      author: "Y tá Trần Văn Nam",
    },
    {
      id: "3",
      title: "Báo cáo sự cố y tế tuần",
      date: "22/12/2024",
      type: "weekly",
      status: "completed",
      author: "Trưởng phòng Y tế",
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "📈";
      case "down":
        return "📉";
      case "stable":
        return "➖";
      default:
        return "➖";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return MedicalColors.success;
      case "pending":
        return MedicalColors.warning;
      case "draft":
        return MedicalColors.textMuted;
      default:
        return MedicalColors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "pending":
        return "Đang xử lý";
      case "draft":
        return "Nháp";
      default:
        return "Không xác định";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "monthly":
        return "📅";
      case "weekly":
        return "📋";
      case "annual":
        return "📊";
      case "emergency":
        return "🚨";
      default:
        return "📄";
    }
  };

  const openReportDetail = (report: RecentReport) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const getRoleBasedActions = () => {
    switch (userRole) {
      case "administrator":
        return [
          {
            title: "Tạo báo cáo mới",
            icon: "📝",
            action: () =>
              Alert.alert("Tạo báo cáo", "Chức năng tạo báo cáo mới"),
          },
          {
            title: "Xuất dữ liệu",
            icon: "📤",
            action: () =>
              Alert.alert("Xuất dữ liệu", "Xuất báo cáo ra file Excel/PDF"),
          },
          {
            title: "Cài đặt báo cáo",
            icon: "⚙️",
            action: () => Alert.alert("Cài đặt", "Cấu hình định dạng báo cáo"),
          },
        ];
      case "medical_staff":
        return [
          {
            title: "Báo cáo nhanh",
            icon: "⚡",
            action: () =>
              Alert.alert("Báo cáo nhanh", "Tạo báo cáo sự cố y tế"),
          },
          {
            title: "Thống kê lớp",
            icon: "📊",
            action: () => Alert.alert("Thống kê lớp", "Xem thống kê theo lớp"),
          },
        ];
      default:
        return [
          {
            title: "Xem báo cáo con",
            icon: "👶",
            action: () =>
              Alert.alert("Báo cáo con", "Xem báo cáo sức khỏe của con"),
          },
        ];
    }
  };

  const TabButton = ({
    title,
    isActive,
    onPress,
  }: {
    title: string;
    isActive: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}
    >
      <Text
        style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <CustomHeader
        title="Báo cáo & Thống kê"
        subtitle="Hệ thống quản lý báo cáo y tế"
        icon={<Text style={{ fontSize: 14 }}>{MedicalIcons.report}</Text>}
      />
      <View style={styles.container}>
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TabButton
            title="Tổng quan"
            isActive={activeTab === "overview"}
            onPress={() => setActiveTab("overview")}
          />
          <TabButton
            title="Thống kê"
            isActive={activeTab === "statistics"}
            onPress={() => setActiveTab("statistics")}
          />
          <TabButton
            title="Báo cáo"
            isActive={activeTab === "reports"}
            onPress={() => setActiveTab("reports")}
          />
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {activeTab === "overview" && (
            <View style={styles.overviewContainer}>
              {/* Report Cards */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 Chỉ số tổng quan</Text>
                <View style={styles.cardsContainer}>
                  {reportCards.map((card) => (
                    <View
                      key={card.id}
                      style={[styles.card, { borderLeftColor: card.color }]}
                    >
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardIcon}>{card.icon}</Text>
                        <Text style={styles.cardTrend}>
                          {getTrendIcon(card.trend)}
                        </Text>
                      </View>
                      <Text style={styles.cardValue}>{card.value}</Text>
                      <Text style={styles.cardTitle}>{card.title}</Text>
                      <Text style={styles.cardDescription}>
                        {card.description}
                      </Text>
                      <Text style={styles.cardPeriod}>{card.period}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Quick Actions */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚡ Thao tác nhanh</Text>
                <View style={styles.actionsContainer}>
                  {getRoleBasedActions().map((action, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.actionButton}
                      onPress={action.action}
                    >
                      <Text style={styles.actionIcon}>{action.icon}</Text>
                      <Text style={styles.actionTitle}>{action.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {activeTab === "statistics" && (
            <View style={styles.statisticsContainer}>
              <Text style={styles.sectionTitle}>📈 Thống kê chi tiết</Text>
              {healthStatistics.map((stat) => (
                <View key={stat.id} style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <Text style={styles.statCategory}>{stat.category}</Text>
                    <Text style={styles.statPercentage}>
                      {stat.percentage}%
                    </Text>
                  </View>
                  <View style={styles.statDetails}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Tổng số:</Text>
                      <Text style={styles.statValue}>{stat.total}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text
                        style={[
                          styles.statLabel,
                          { color: MedicalColors.success },
                        ]}
                      >
                        Khỏe mạnh:
                      </Text>
                      <Text
                        style={[
                          styles.statValue,
                          { color: MedicalColors.success },
                        ]}
                      >
                        {stat.healthy}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text
                        style={[
                          styles.statLabel,
                          { color: MedicalColors.warning },
                        ]}
                      >
                        Cần theo dõi:
                      </Text>
                      <Text
                        style={[
                          styles.statValue,
                          { color: MedicalColors.warning },
                        ]}
                      >
                        {stat.needsAttention}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text
                        style={[
                          styles.statLabel,
                          { color: MedicalColors.error },
                        ]}
                      >
                        Khẩn cấp:
                      </Text>
                      <Text
                        style={[
                          styles.statValue,
                          { color: MedicalColors.error },
                        ]}
                      >
                        {stat.urgent}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${stat.percentage}%` },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}

          {activeTab === "reports" && (
            <View style={styles.reportsContainer}>
              <Text style={styles.sectionTitle}>📋 Báo cáo gần đây</Text>
              {recentReports.map((report) => (
                <TouchableOpacity
                  key={report.id}
                  style={styles.reportCard}
                  onPress={() => openReportDetail(report)}
                >
                  <View style={styles.reportHeader}>
                    <Text style={styles.reportIcon}>
                      {getTypeIcon(report.type)}
                    </Text>
                    <View style={styles.reportInfo}>
                      <Text style={styles.reportTitle}>{report.title}</Text>
                      <Text style={styles.reportAuthor}>
                        Tác giả: {report.author}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: getStatusColor(report.status) + "20",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(report.status) },
                        ]}
                      >
                        {getStatusText(report.status)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.reportDate}>Ngày: {report.date}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Report Detail Modal */}
        <Modal
          visible={showDetailModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowDetailModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chi tiết báo cáo</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowDetailModal(false)}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalBody}>
                {selectedReport && (
                  <>
                    <Text style={styles.detailTitle}>
                      {selectedReport.title}
                    </Text>
                    <Text style={styles.detailInfo}>
                      Tác giả: {selectedReport.author}
                    </Text>
                    <Text style={styles.detailInfo}>
                      Ngày tạo: {selectedReport.date}
                    </Text>
                    <Text style={styles.detailInfo}>
                      Loại: {selectedReport.type}
                    </Text>
                    <Text style={styles.detailInfo}>
                      Trạng thái: {getStatusText(selectedReport.status)}
                    </Text>

                    <View style={styles.detailContent}>
                      <Text style={styles.detailSectionTitle}>
                        Nội dung báo cáo:
                      </Text>
                      <Text style={styles.detailText}>
                        Đây là nội dung chi tiết của báo cáo. Trong thực tế, nội
                        dung này sẽ được lấy từ cơ sở dữ liệu.
                      </Text>
                    </View>
                  </>
                )}
              </View>
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowDetailModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Đóng</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => {
                    Alert.alert(
                      "Xuất báo cáo",
                      "Báo cáo đã được xuất thành công"
                    );
                    setShowDetailModal(false);
                  }}
                >
                  <Text style={styles.confirmButtonText}>Xuất PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: MedicalColors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 5,
  },
  activeTabButton: {
    backgroundColor: MedicalColors.primary + "20",
  },
  tabButtonText: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    fontWeight: "500",
  },
  activeTabButtonText: {
    color: MedicalColors.primary,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  overviewContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 15,
  },
  cardsContainer: {
    gap: 15,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardTrend: {
    fontSize: 16,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    marginBottom: 5,
  },
  cardPeriod: {
    fontSize: 12,
    color: MedicalColors.textMuted,
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  actionButton: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    minWidth: 100,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: MedicalColors.textPrimary,
    textAlign: "center",
  },
  statisticsContainer: {
    padding: 20,
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statCategory: {
    fontSize: 16,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
  },
  statPercentage: {
    fontSize: 18,
    fontWeight: "bold",
    color: MedicalColors.primary,
  },
  statDetails: {
    marginBottom: 10,
  },
  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
  },
  progressBar: {
    height: 6,
    backgroundColor: MedicalColors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: MedicalColors.primary,
    borderRadius: 3,
  },
  reportsContainer: {
    padding: 20,
  },
  reportCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  reportIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    marginBottom: 2,
  },
  reportAuthor: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "500",
  },
  reportDate: {
    fontSize: 12,
    color: MedicalColors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    width: width - 40,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: MedicalColors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: MedicalColors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 20,
    color: MedicalColors.textSecondary,
  },
  modalBody: {
    padding: 20,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 15,
  },
  detailInfo: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    marginBottom: 8,
  },
  detailContent: {
    marginTop: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: MedicalColors.border,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
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
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: MedicalColors.primary,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
});
