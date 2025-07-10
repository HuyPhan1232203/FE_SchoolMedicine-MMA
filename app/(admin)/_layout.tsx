import { router, Tabs } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { HapticTab } from "../../components/HapticTab";
import TabBarBackground from "../../components/ui/TabBarBackground";
import { Colors, MedicalColors } from "../../constants/Colors";
import { useAuth } from "../../hooks/useAuth";
import { useColorScheme } from "../../hooks/useColorScheme";

export default function AdminLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { userProfile, loading, canAccess } = useAuth();

  useEffect(() => {
    if (!loading) {
      // Kiểm tra quyền admin
      if (!canAccess || !userProfile || userProfile.role !== "administrator") {
        console.log("Admin access denied, redirecting to login");
        router.replace("/Login");
        return;
      }
    }
  }, [userProfile, loading, canAccess]);

  // Hiển thị loading hoặc không có quyền
  if (
    loading ||
    !canAccess ||
    !userProfile ||
    userProfile.role !== "administrator"
  ) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          backgroundColor: Colors[colorScheme ?? "light"].background,
          borderTopWidth: 1,
          borderTopColor: MedicalColors.border,
          position: "relative",
          left: 0,
          right: 0,
          bottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="Dashboard"
        options={{
          title: "Dashboard",
          tabBarLabel: "Tổng quan",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="dashboard" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="UserManagement"
        options={{
          title: "User",
          tabBarLabel: "Người dùng",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="users" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="SystemConfig"
        options={{
          title: "Cấu hình",
          tabBarLabel: "Cấu hình",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="settings" size={24} color={color} />
          ),
        }}
      />

      {/* Hidden screens - accessible via navigation but not in tabs */}
      <Tabs.Screen
        name="MedicalEvents"
        options={{
          href: null, // Hide from tab bar
          title: "Sự kiện Y tế",
        }}
      />
      <Tabs.Screen
        name="DrugManagement"
        options={{
          href: null, // Hide from tab bar
          title: "Quản lý Thuốc",
        }}
      />
      <Tabs.Screen
        name="RequestApproval"
        options={{
          href: null, // Hide from tab bar
          title: "Duyệt yêu cầu",
        }}
      />
      <Tabs.Screen
        name="AdminImport"
        options={{
          href: null, // Hide from tab bar
          title: "Import",
        }}
      />
      <Tabs.Screen
        name="ChangePassword"
        options={{
          href: null, // Hide from tab bar
          title: "Đổi mật khẩu",
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          href: null, // Hide from tab bar
          title: "Hồ sơ",
        }}
      />
    </Tabs>
  );
}
