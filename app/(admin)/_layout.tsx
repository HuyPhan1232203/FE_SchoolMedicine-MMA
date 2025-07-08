import { router, Tabs } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { HapticTab } from "../../components/HapticTab";
import TabBarBackground from "../../components/ui/TabBarBackground";
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../hooks/useAuth";
import { useColorScheme } from "../../hooks/useColorScheme";
import { UserRole } from "../../services/userService";

export default function AdminLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { userProfile, loading, canAccess } = useAuth();

  useEffect(() => {
    if (!loading) {
      // Kiểm tra quyền admin
      if (
        !canAccess ||
        !userProfile ||
        userProfile.role !== UserRole.ADMINISTRATOR
      ) {
        router.replace("/(tabs)/Home");
        return;
      }
    }
  }, [userProfile, loading, canAccess]);

  // Hiển thị loading hoặc không có quyền
  if (
    loading ||
    !canAccess ||
    !userProfile ||
    userProfile.role !== UserRole.ADMINISTRATOR
  ) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          android: {
            paddingTop: insets.top,
            height: 60 + insets.top,
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="Dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="dashboard" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="UserManagement"
        options={{
          title: "Quản lý User",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="users" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="RequestApproval"
        options={{
          title: "Duyệt yêu cầu",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="approval" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="SystemConfig"
        options={{
          title: "Cấu hình",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
