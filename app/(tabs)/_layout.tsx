import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Thêm import này

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Fontisto from "@expo/vector-icons/Fontisto";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets(); // Thêm dòng này

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
            // Thêm padding cho Android
            paddingTop: insets.top,
            height: 60 + insets.top, // Điều chỉnh height nếu cần
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: "Home",
          tabBarLabel: "Trang chủ",
          tabBarIcon: ({ color }) => (
            <Fontisto name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Report"
        options={{
          title: "Report",
          tabBarLabel: "Báo cáo",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="notes-medical" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Setting"
        options={{
          title: "Setting",
          tabBarLabel: "Cài đặt",
          tabBarIcon: ({ color }) => (
            <Fontisto name="player-settings" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="MedicalTools"
        options={{
          title: "Dụng cụ Y tế",
          tabBarButton: () => null, // Ẩn khỏi tab bar, chỉ điều hướng bằng code
        }}
      />
      <Tabs.Screen
        name="EventReport"
        options={{
          title: "Khai báo sự kiện",
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="Vaccination"
        options={{
          title: "Tiêm chủng",
          tabBarButton: () => null,
        }}
      />
    </Tabs>
  );
}
