import { router } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomHeader from "../../components/CustomHeader";
import { MedicalColors, MedicalIcons } from "../../constants/Colors";
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
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (userProfile && userProfile.role !== "administrator") {
      router.replace("/Login");
    }
  }, [userProfile]);

  const loadDashboardData = async () => {
    try {
      setError(null);

      // Load users and medical events in parallel for better performance
      const [usersSnapshot, medicalEvents] = await Promise.all([
        getDocs(collection(db, "users")),
        getMedicalEvents(),
      ]);

      const users: UserProfile[] = [];
      usersSnapshot.forEach((doc) => {
        users.push(doc.data() as UserProfile);
      });

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
      setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại.");
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
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        width: (width - 48) / 2,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: color,
      }}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.85}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: color + "20",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 20 }}>{icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: MedicalColors.textPrimary,
              marginBottom: 2,
            }}
          >
            {value}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: MedicalColors.textSecondary,
              fontWeight: "500",
            }}
          >
            {title}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleMenu = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Huỷ", "Đăng xuất", "Cài đặt", "Thông tin"],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            // Đăng xuất
            router.replace("/Login");
          }
          // Thêm các chức năng khác nếu cần
        }
      );
    } else {
      setShowMenu(true);
    }
  };

  if (loading) {
    return (
      <View
        style={{ flex: 1, backgroundColor: MedicalColors.backgroundSecondary }}
      >
        <CustomHeader
          title="Tổng quan"
          icon={<Text style={{ fontSize: 14 }}>{MedicalIcons.info}</Text>}
        />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={MedicalColors.primary} />
          <Text style={{ marginTop: 10, color: MedicalColors.textSecondary }}>
            Đang tải dashboard...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{ flex: 1, backgroundColor: MedicalColors.backgroundSecondary }}
      >
        <CustomHeader
          title="Tổng quan"
          icon={<Text style={{ fontSize: 14 }}>{MedicalIcons.info}</Text>}
        />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 20, color: "#E74C3C", marginBottom: 10 }}>
            ⚠️
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: MedicalColors.textPrimary,
              marginBottom: 10,
            }}
          >
            {error}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: MedicalColors.primary,
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 10,
            }}
            onPress={loadDashboardData}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
              Thử lại
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <>
      {/* Header mới đồng nhất */}
      <CustomHeader
        title="Tổng quan"
        icon={<Text style={{ fontSize: 14 }}>{MedicalIcons.info}</Text>}
      />
      <View
        style={{ flex: 1, backgroundColor: MedicalColors.backgroundSecondary }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Main Stats */}
          <View style={{ marginBottom: 20, paddingHorizontal: 16 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: MedicalColors.textPrimary,
                marginBottom: 12,
              }}
            >
              📊 Thống kê tổng quan
            </Text>
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 16,
                shadowColor: MedicalColors.shadowLight,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <View style={{ alignItems: "center", flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: MedicalColors.primary,
                    }}
                  >
                    {stats.totalUsers}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: MedicalColors.textSecondary }}
                  >
                    Tổng Users
                  </Text>
                </View>
                <View style={{ alignItems: "center", flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#27AE60",
                    }}
                  >
                    {stats.activeUsers}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: MedicalColors.textSecondary }}
                  >
                    Đang hoạt động
                  </Text>
                </View>
                <View style={{ alignItems: "center", flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#F39C12",
                    }}
                  >
                    {stats.pendingUsers}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: MedicalColors.textSecondary }}
                  >
                    Chờ duyệt
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ alignItems: "center", flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#E74C3C",
                    }}
                  >
                    {stats.totalMedicalEvents}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: MedicalColors.textSecondary }}
                  >
                    Sự kiện Y tế
                  </Text>
                </View>
                <View style={{ alignItems: "center", flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#9B59B6",
                    }}
                  >
                    {stats.totalParents}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: MedicalColors.textSecondary }}
                  >
                    Phụ huynh
                  </Text>
                </View>
                <View style={{ alignItems: "center", flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#3498DB",
                    }}
                  >
                    {stats.totalMedicalStaff}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: MedicalColors.textSecondary }}
                  >
                    Cán bộ Y tế
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={{ marginBottom: 20, paddingHorizontal: 16 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: MedicalColors.textPrimary,
                marginBottom: 12,
              }}
            >
              ⚡ Thao tác nhanh
            </Text>
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 16,
                shadowColor: MedicalColors.shadowLight,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                {[
                  {
                    key: "user-management",
                    icon: "👥",
                    text: "Quản lý User",
                    onPress: () =>
                      router.push("/(admin)/UserManagement" as any),
                    color: MedicalColors.primary,
                  },
                  {
                    key: "request-approval",
                    icon: "✅",
                    text: "Duyệt yêu cầu",
                    onPress: () =>
                      router.push("/(admin)/RequestApproval" as any),
                    color: MedicalColors.success,
                  },
                  {
                    key: "admin-import",
                    icon: "📤",
                    text: "Import Users",
                    onPress: () => router.push("/AdminImport"),
                    color: MedicalColors.warning,
                  },
                  {
                    key: "system-config",
                    icon: "⚙️",
                    text: "Cấu hình",
                    onPress: () => router.push("/(admin)/SystemConfig" as any),
                    color: MedicalColors.accent,
                  },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={{
                      backgroundColor: item.color + "10",
                      borderRadius: 12,
                      padding: 16,
                      width: (width - 80) / 2,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: item.color + "30",
                    }}
                    onPress={item.onPress}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 24, marginBottom: 8 }}>
                      {item.icon}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: MedicalColors.textPrimary,
                        textAlign: "center",
                      }}
                    >
                      {item.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={{ marginBottom: 24, paddingHorizontal: 16 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: MedicalColors.textPrimary,
                marginBottom: 12,
              }}
            >
              🕐 Hoạt động gần đây
            </Text>
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 16,
                shadowColor: MedicalColors.shadowLight,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View style={{ flexDirection: "row", marginBottom: 16 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    alignItems: "center",
                    paddingVertical: 8,
                    borderBottomWidth: 2,
                    borderBottomColor: MedicalColors.primary,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: MedicalColors.primary,
                    }}
                  >
                    Người dùng mới ({stats.recentUsers.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    alignItems: "center",
                    paddingVertical: 8,
                    borderBottomWidth: 2,
                    borderBottomColor: "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: MedicalColors.textSecondary,
                    }}
                  >
                    Sự kiện Y tế ({stats.recentEvents.length})
                  </Text>
                </TouchableOpacity>
              </View>

              {stats.recentUsers.slice(0, 3).map((user) => (
                <View
                  key={user.uid}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: "#f5f5f5",
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: MedicalColors.primary + "20",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>👤</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: MedicalColors.textPrimary,
                      }}
                    >
                      {user.fullName}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: MedicalColors.textSecondary,
                        marginTop: 2,
                      }}
                    >
                      {user.role === UserRole.PARENT
                        ? "Phụ huynh"
                        : user.role === UserRole.MEDICAL_STAFF
                        ? "Cán bộ Y tế"
                        : "Quản trị viên"}{" "}
                      • {formatDate(user.createdAt)}
                    </Text>
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                      backgroundColor:
                        getStatusDisplayInfo(user.status).color + "20",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: getStatusDisplayInfo(user.status).color,
                      }}
                    >
                      {getStatusDisplayInfo(user.status).icon}{" "}
                      {getStatusDisplayInfo(user.status).name}
                    </Text>
                  </View>
                </View>
              ))}

              {stats.recentUsers.length === 0 && (
                <View style={{ alignItems: "center", paddingVertical: 20 }}>
                  <Text
                    style={{ fontSize: 16, color: MedicalColors.textSecondary }}
                  >
                    Chưa có người dùng mới
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
