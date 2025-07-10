import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomHeader from "../../components/CustomHeader";
import {
  MedicalColors,
  MedicalIcons,
  RoleColors,
} from "../../constants/Colors";
import { useAuth } from "../../hooks/useAuth";

const { width } = Dimensions.get("window");

interface HealthMetric {
  id: string;
  title: string;
  value: string;
  icon: string;
  trend: "up" | "down" | "stable";
  color: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
}

interface RecentActivity {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "checkup" | "vaccination" | "emergency" | "report";
  icon: string;
}

export default function Home() {
  const { userProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const userRole = userProfile?.role || "parent";
  const router = useRouter();

  useEffect(() => {
    if (userProfile?.role === "administrator") {
      router.replace("/(admin)/Dashboard");
    }
  }, [userProfile]);

  if (userProfile?.role === "administrator") {
    // Chỉ render loading, không render UI Home
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Mock data - would come from backend
  const healthMetrics: HealthMetric[] = [
    {
      id: "1",
      title: "Học sinh khỏe mạnh",
      value: "328/350",
      icon: MedicalIcons.check,
      trend: "up",
      color: MedicalColors.success,
    },
    {
      id: "2",
      title: "Cần theo dõi",
      value: "18",
      icon: MedicalIcons.warning,
      trend: "stable",
      color: MedicalColors.warning,
    },
    {
      id: "3",
      title: "Khám sức khỏe hôm nay",
      value: "12",
      icon: MedicalIcons.stethoscope,
      trend: "down",
      color: MedicalColors.info,
    },
    {
      id: "4",
      title: "Tiêm chủng cần làm",
      value: "5",
      icon: MedicalIcons.syringe,
      trend: "stable",
      color: MedicalColors.accent,
    },
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: "1",
      title: "Khám sức khỏe định kỳ",
      description: "Lớp 6A - 25 học sinh đã hoàn thành",
      time: "2 giờ trước",
      type: "checkup",
      icon: MedicalIcons.stethoscope,
    },
    {
      id: "2",
      title: "Tiêm vaccine phòng cúm",
      description: "Đợt 1 - 150 học sinh đã tiêm",
      time: "5 giờ trước",
      type: "vaccination",
      icon: MedicalIcons.syringe,
    },
    {
      id: "3",
      title: "Báo cáo sức khỏe tháng",
      description: "Tháng 11/2024 đã hoàn thành",
      time: "1 ngày trước",
      type: "report",
      icon: MedicalIcons.report,
    },
  ];

  const getQuickActions = (): QuickAction[] => {
    const commonActions = [
      {
        id: "health-check",
        title: "Khám sức khỏe",
        description: "Đăng ký khám sức khỏe",
        icon: MedicalIcons.stethoscope,
        color: MedicalColors.primary,
        action: () => router.push("/(tabs)/MedicalTools"),
      },
      {
        id: "vaccination",
        title: "Tiêm chủng",
        description: "Lịch tiêm và đăng ký",
        icon: MedicalIcons.syringe,
        color: MedicalColors.accent,
        action: () => router.push("/(tabs)/Vaccination"),
      },
    ];

    switch (userRole) {
      case "parent":
        return [
          ...commonActions,
          {
            id: "child-health",
            title: "Sức khỏe con em",
            description: "Xem thông tin sức khỏe",
            icon: MedicalIcons.family,
            color: RoleColors.parent.primary,
            action: () => router.push("/(tabs)/Report"),
          },
          {
            id: "emergency",
            title: "Khẩn cấp",
            description: "Liên hệ y tế khẩn cấp",
            icon: MedicalIcons.alert,
            color: MedicalColors.error,
            action: () => Alert.alert("Khẩn cấp", "Hotline: 0123-456-789"),
          },
        ];
      case "medical_staff":
        return [
          ...commonActions,
          {
            id: "patient-list",
            title: "Danh sách bệnh nhân",
            description: "Quản lý học sinh cần điều trị",
            icon: MedicalIcons.doctor,
            color: RoleColors.medical_staff.primary,
            action: () => router.push("/(tabs)/Report"),
          },
          {
            id: "medical-record",
            title: "Hồ sơ y tế",
            description: "Cập nhật hồ sơ sức khỏe",
            icon: MedicalIcons.report,
            color: MedicalColors.secondary,
            action: () => router.push("/(tabs)/EventReport"),
          },
        ];
      case "administrator":
        return [
          ...commonActions,
          {
            id: "analytics",
            title: "Thống kê y tế",
            description: "Báo cáo và phân tích",
            icon: MedicalIcons.report,
            color: RoleColors.administrator.primary,
            action: () => router.push("/(admin)/Dashboard"),
          },
          {
            id: "manage-staff",
            title: "Quản lý nhân sự",
            description: "Quản lý cán bộ y tế",
            icon: MedicalIcons.nurse,
            color: MedicalColors.accent,
            action: () => router.push("/(admin)/UserManagement"),
          },
        ];
      default:
        return commonActions;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const getRoleInfo = () => {
    const roleInfo = {
      parent: {
        title: "Phụ huynh",
        greeting: "Chăm sóc sức khỏe con em",
        icon: RoleColors.parent.icon,
        color: RoleColors.parent.primary,
      },
      medical_staff: {
        title: "Cán bộ Y tế",
        greeting: "Bảo vệ sức khỏe học sinh",
        icon: RoleColors.medical_staff.icon,
        color: RoleColors.medical_staff.primary,
      },
      administrator: {
        title: "Quản lý",
        greeting: "Điều hành hệ thống y tế",
        icon: RoleColors.administrator.icon,
        color: RoleColors.administrator.primary,
      },
    };
    return roleInfo[userRole];
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "checkup":
        return MedicalIcons.stethoscope;
      case "vaccination":
        return MedicalIcons.syringe;
      case "emergency":
        return MedicalIcons.alert;
      case "report":
        return MedicalIcons.report;
      default:
        return MedicalIcons.info;
    }
  };

  const roleInfo = getRoleInfo();
  const quickActions = getQuickActions();

  // Thao tác nhanh cho nurse
  const nurseActions = [
    {
      id: "medical-tools",
      title: "Khai báo dụng cụ",
      description: "Thêm/xóa/sửa dụng cụ y tế",
      icon: MedicalIcons.stethoscope,
      color: MedicalColors.primary,
      action: () => router.push("/MedicalTools"),
    },
    {
      id: "event-report",
      title: "Khai báo sự kiện",
      description: "Khai báo sự kiện trong trường",
      icon: MedicalIcons.alert,
      color: MedicalColors.error,
      action: () => router.push("/EventReport"),
    },
    {
      id: "vaccination",
      title: "Quản lý tiêm chủng",
      description: "Quản lý lịch và báo cáo tiêm chủng",
      icon: MedicalIcons.syringe,
      color: MedicalColors.accent,
      action: () => router.push("/Vaccination"),
    },
  ];

  if (!userProfile) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Đang tải thông tin người dùng...</Text>
      </View>
    );
  }

  console.log("userProfile in Home:", userProfile);
  console.log("userRole in Home:", userRole);

  return (
    <>
      <CustomHeader
        title="Trang chủ"
        subtitle={roleInfo?.title}
        icon={<Text style={{ fontSize: 14 }}>{MedicalIcons.health}</Text>}
      />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Nếu là nurse thì show 3 button riêng */}
        {userRole === "medical_staff" ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ Thao tác nhanh</Text>
            <View style={styles.actionsGrid}>
              {nurseActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.actionCard, { borderLeftColor: action.color }]}
                  onPress={action.action}
                >
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionDescription}>
                      {action.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <>
            {/* Health Metrics Cards */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {MedicalIcons.health} Tổng quan sức khỏe
              </Text>
              <View style={styles.metricsGrid}>
                {healthMetrics.map((metric) => (
                  <View key={metric.id} style={styles.metricCard}>
                    <View style={styles.metricHeader}>
                      <Text style={styles.metricIcon}>{metric.icon}</Text>
                      <Text style={styles.metricTrend}>
                        {getTrendIcon(metric.trend)}
                      </Text>
                    </View>
                    <Text style={[styles.metricValue, { color: metric.color }]}>
                      {metric.value}
                    </Text>
                    <Text style={styles.metricTitle}>{metric.title}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚡ Thao tác nhanh</Text>
              <View style={styles.actionsGrid}>
                {quickActions.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={[
                      styles.actionCard,
                      { borderLeftColor: action.color },
                    ]}
                    onPress={action.action}
                  >
                    <Text style={styles.actionIcon}>{action.icon}</Text>
                    <View style={styles.actionContent}>
                      <Text style={styles.actionTitle}>{action.title}</Text>
                      <Text style={styles.actionDescription}>
                        {action.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recent Activities */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {MedicalIcons.calendar} Hoạt động gần đây
              </Text>
              <View style={styles.activitiesList}>
                {recentActivities.map((activity) => (
                  <View key={activity.id} style={styles.activityItem}>
                    <View style={styles.activityIcon}>
                      <Text>{getActivityIcon(activity.type)}</Text>
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Text style={styles.activityDescription}>
                        {activity.description}
                      </Text>
                      <Text style={styles.activityTime}>{activity.time}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Emergency Contact */}
            <View style={[styles.section, styles.emergencySection]}>
              <View style={styles.emergencyHeader}>
                <Text style={styles.emergencyIcon}>{MedicalIcons.alert}</Text>
                <Text style={styles.emergencyTitle}>Liên hệ khẩn cấp</Text>
              </View>
              <Text style={styles.emergencyDescription}>
                Liên hệ ngay với đội ngũ y tế khi có tình huống khẩn cấp
              </Text>
              <TouchableOpacity
                style={styles.emergencyButton}
                onPress={() =>
                  Alert.alert("Khẩn cấp", "Đã kết nối với y tế trường...")
                }
              >
                <Text style={styles.emergencyButtonText}>
                  📞 Gọi ngay: 0123-456-789
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomPadding} />
          </>
        )}
      </ScrollView>
    </>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  roleIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  userText: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginVertical: 2,
  },
  roleGreeting: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  notificationButton: {
    position: "relative",
    padding: 8,
  },
  notificationIcon: {
    fontSize: 24,
    color: "#FFFFFF",
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: MedicalColors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricCard: {
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
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  metricIcon: {
    fontSize: 24,
  },
  metricTrend: {
    fontSize: 16,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  metricTitle: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
    fontWeight: "500",
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
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
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
  },
  activitiesList: {
    gap: 12,
  },
  activityItem: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MedicalColors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: MedicalColors.textMuted,
  },
  emergencySection: {
    backgroundColor: "#FFF5F5",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: MedicalColors.error,
    margin: 20,
  },
  emergencyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  emergencyIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: MedicalColors.error,
  },
  emergencyDescription: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    marginBottom: 15,
    lineHeight: 20,
  },
  emergencyButton: {
    backgroundColor: MedicalColors.error,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  emergencyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomPadding: {
    height: 100,
  },
});
