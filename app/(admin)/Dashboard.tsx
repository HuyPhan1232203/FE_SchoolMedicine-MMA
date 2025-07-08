import { router } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MedicalColors } from "../../constants/Colors";
import { useAuth } from "../../hooks/useAuth";
import { db } from "../../lib/firebase";
import {
  getMedicalEvents,
  MedicalEvent,
} from "../../services/medicalEventService";
import {
  getStatusDisplayInfo,
  UserProfile,
  UserRole,
  UserStatus,
} from "../../services/userService";

const { width } = Dimensions.get("window");

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  rejectedUsers: number;
  suspendedUsers: number;
  totalParents: number;
  totalMedicalStaff: number;
  totalAdmins: number;
  totalMedicalEvents: number;
  recentEvents: (MedicalEvent & { id: string })[];
  recentUsers: UserProfile[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    rejectedUsers: 0,
    suspendedUsers: 0,
    totalParents: 0,
    totalMedicalStaff: 0,
    totalAdmins: 0,
    totalMedicalEvents: 0,
    recentEvents: [],
    recentUsers: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { userProfile } = useAuth();

  const loadDashboardData = async () => {
    try {
      // Load users data
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);
      const users: UserProfile[] = [];

      usersSnapshot.forEach((doc) => {
        users.push(doc.data() as UserProfile);
      });

      // Load medical events
      const medicalEvents = await getMedicalEvents();

      // Calculate stats
      const totalUsers = users.length;
      const activeUsers = users.filter(
        (u) => u.status === UserStatus.ACTIVE
      ).length;
      const pendingUsers = users.filter(
        (u) => u.status === UserStatus.PENDING
      ).length;
      const rejectedUsers = users.filter(
        (u) => u.status === UserStatus.REJECTED
      ).length;
      const suspendedUsers = users.filter(
        (u) => u.status === UserStatus.SUSPENDED
      ).length;
      const totalParents = users.filter(
        (u) => u.role === UserRole.PARENT
      ).length;
      const totalMedicalStaff = users.filter(
        (u) => u.role === UserRole.MEDICAL_STAFF
      ).length;
      const totalAdmins = users.filter(
        (u) => u.role === UserRole.ADMINISTRATOR
      ).length;

      // Get recent data
      const recentUsers = users
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
        .slice(0, 5);

      const recentEvents = medicalEvents
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5);

      setStats({
        totalUsers,
        activeUsers,
        pendingUsers,
        rejectedUsers,
        suspendedUsers,
        totalParents,
        totalMedicalStaff,
        totalAdmins,
        totalMedicalEvents: medicalEvents.length,
        recentEvents,
        recentUsers,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("vi-VN");
  };

  const StatCard = ({
    title,
    value,
    icon,
    color,
    onPress,
  }: {
    title: string;
    value: number;
    icon: string;
    color: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.statCardContent}>
        <Text style={styles.statIcon}>{icon}</Text>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MedicalColors.primary} />
        <Text style={styles.loadingText}>Đang tải dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Chào mừng, {userProfile?.fullName}
        </Text>
        <Text style={styles.headerTitle}>Dashboard Quản Trị</Text>
        <Text style={styles.headerSubtitle}>
          Tổng quan hệ thống y tế học đường
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Thống kê tổng quan</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Tổng Users"
            value={stats.totalUsers}
            icon="👥"
            color={MedicalColors.primary}
            onPress={() => router.push("/(admin)/UserManagement" as any)}
          />
          <StatCard
            title="Đang hoạt động"
            value={stats.activeUsers}
            icon="🟢"
            color="#27AE60"
          />
          <StatCard
            title="Chờ duyệt"
            value={stats.pendingUsers}
            icon="⏳"
            color="#F39C12"
            onPress={() => router.push("/(admin)/RequestApproval" as any)}
          />
          <StatCard
            title="Sự kiện Y tế"
            value={stats.totalMedicalEvents}
            icon="🏥"
            color="#E74C3C"
          />
        </View>
      </View>

      {/* User Role Distribution */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👨‍👩‍👧‍👦 Phân bố vai trò</Text>
        <View style={styles.roleGrid}>
          <StatCard
            title="Phụ huynh"
            value={stats.totalParents}
            icon="👨‍👩‍👧‍👦"
            color="#3498DB"
          />
          <StatCard
            title="Cán bộ Y tế"
            value={stats.totalMedicalStaff}
            icon="👩‍⚕️"
            color="#9B59B6"
          />
          <StatCard
            title="Quản trị viên"
            value={stats.totalAdmins}
            icon="👨‍💼"
            color="#E67E22"
          />
        </View>
      </View>

      {/* User Status Distribution */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Trạng thái tài khoản</Text>
        <View style={styles.statusGrid}>
          <StatCard
            title="Bị từ chối"
            value={stats.rejectedUsers}
            icon="❌"
            color="#E74C3C"
          />
          <StatCard
            title="Bị tạm dừng"
            value={stats.suspendedUsers}
            icon="⛔"
            color="#E67E22"
          />
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🕐 Hoạt động gần đây</Text>

        {/* Recent Users */}
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Người dùng mới</Text>
          {stats.recentUsers.map((user, index) => (
            <View key={user.uid} style={styles.recentItem}>
              <View style={styles.recentItemLeft}>
                <Text style={styles.recentItemIcon}>👤</Text>
                <View>
                  <Text style={styles.recentItemName}>{user.fullName}</Text>
                  <Text style={styles.recentItemDetail}>
                    {user.role === UserRole.PARENT
                      ? "Phụ huynh"
                      : user.role === UserRole.MEDICAL_STAFF
                      ? "Cán bộ Y tế"
                      : "Quản trị viên"}
                  </Text>
                </View>
              </View>
              <View style={styles.recentItemRight}>
                <Text
                  style={[
                    styles.recentItemStatus,
                    { color: getStatusDisplayInfo(user.status).color },
                  ]}
                >
                  {getStatusDisplayInfo(user.status).icon}
                </Text>
                <Text style={styles.recentItemDate}>
                  {formatDate(user.createdAt)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Medical Events */}
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Sự kiện Y tế gần đây</Text>
          {stats.recentEvents.map((event, index) => (
            <View key={event.id} style={styles.recentItem}>
              <View style={styles.recentItemLeft}>
                <Text style={styles.recentItemIcon}>🏥</Text>
                <View>
                  <Text style={styles.recentItemName}>{event.fullName}</Text>
                  <Text style={styles.recentItemDetail}>
                    {event.eventType} - {event.grade}
                  </Text>
                </View>
              </View>
              <View style={styles.recentItemRight}>
                <Text style={styles.recentItemDate}>
                  {formatDate(event.createdAt)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Thao tác nhanh</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/(admin)/UserManagement" as any)}
          >
            <Text style={styles.actionButtonIcon}>👥</Text>
            <Text style={styles.actionButtonText}>Quản lý User</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/(admin)/RequestApproval" as any)}
          >
            <Text style={styles.actionButtonIcon}>✅</Text>
            <Text style={styles.actionButtonText}>Duyệt yêu cầu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/AdminImport")}
          >
            <Text style={styles.actionButtonIcon}>📤</Text>
            <Text style={styles.actionButtonText}>Import Users</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/(admin)/SystemConfig" as any)}
          >
            <Text style={styles.actionButtonIcon}>⚙️</Text>
            <Text style={styles.actionButtonText}>Cấu hình</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MedicalColors.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: MedicalColors.backgroundSecondary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: MedicalColors.primary,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
    marginTop: 5,
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  roleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  statCard: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: (width - 50) / 2,
    marginBottom: 10,
  },
  statCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
  },
  statTitle: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
    marginTop: 2,
  },
  recentSection: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    marginBottom: 12,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  recentItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  recentItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  recentItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
  },
  recentItemDetail: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
    marginTop: 2,
  },
  recentItemRight: {
    alignItems: "flex-end",
  },
  recentItemStatus: {
    fontSize: 16,
  },
  recentItemDate: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  actionButton: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: (width - 50) / 2,
  },
  actionButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    textAlign: "center",
  },
});
