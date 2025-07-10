// Initialize Firebase first
import "../lib/firebase";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, router, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";
import { useAuth } from "../hooks/useAuth";

import { useColorScheme } from "@/hooks/useColorScheme";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const { user, userProfile, loading, canAccess, accessReason } = useAuth();
  const pathname = usePathname();

  // Điều hướng về đúng khu vực nếu nhập URL sai
  useEffect(() => {
    if (!loading) {
      if (!user) {
        if (
          pathname !== "/Login" &&
          pathname !== "/Register" &&
          pathname !== "/ResetPassword" &&
          pathname !== "/EmailVerification" &&
          pathname !== "/AccountPending"
        ) {
          router.replace("/Login");
        }
        return;
      }
      if (!userProfile) {
        return;
      }
      if (!canAccess) {
        if (accessReason === "Không tìm thấy thông tin tài khoản") {
          router.replace("/Register");
        } else if (accessReason === "Email chưa được xác thực") {
          router.replace("/EmailVerification");
        } else if (accessReason === "Phiên đăng nhập đã hết hạn") {
          router.replace("/Login");
        } else if (userProfile.status === "pending") {
          router.replace("/AccountPending");
        } else {
          router.replace("/Login");
        }
        return;
      }
      // Chỉ cho phép truy cập đúng khu vực role
      const currentPath = pathname;
      const role = String(userProfile.role);
      if (role === "administrator") {
        if (
          currentPath.startsWith("/(tabs)") ||
          // currentPath.startsWith("/(teacher)") || // Dành cho role teacher sau này
          // currentPath.startsWith("/(parent)") || // Dành cho role parent sau này
          currentPath === "/" ||
          currentPath === "/index" ||
          currentPath === "/index.tsx"
        ) {
          router.replace("/(admin)/Dashboard");
        }
        // else if (role === "teacher") {
        //   if (
        //     currentPath.startsWith("/(admin)") ||
        //     currentPath.startsWith("/(tabs)") ||
        //     currentPath.startsWith("/(parent)") ||
        //     currentPath === "/" ||
        //     currentPath === "/index" ||
        //     currentPath === "/index.tsx"
        //   ) {
        //     router.replace("/(teacher)/Home" as string);
        //   }
        // } else if (role === "parent") {
        //   if (
        //     currentPath.startsWith("/(admin)") ||
        //     currentPath.startsWith("/(tabs)") ||
        //     currentPath.startsWith("/(teacher)") ||
        //     currentPath === "/" ||
        //     currentPath === "/index" ||
        //     currentPath === "/index.tsx"
        //   ) {
        //     router.replace("/(parent)/Home" as string);
        //   }
      } else {
        // Mặc định là user
        if (
          currentPath.startsWith("/(admin)") ||
          // currentPath.startsWith("/(teacher)") || // Dành cho role teacher sau này
          // currentPath.startsWith("/(parent)") || // Dành cho role parent sau này
          currentPath === "/" ||
          currentPath === "/index" ||
          currentPath === "/index.tsx"
        ) {
          router.replace("/(tabs)/Home");
        }
      }
    }
  }, [user, userProfile, loading, canAccess, accessReason, pathname]);

  if (!loaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" options={{ title: "Đăng nhập" }} />
          <Stack.Screen name="Register" options={{ title: "Đăng ký" }} />
          <Stack.Screen
            name="ResetPassword"
            options={{ title: "Đặt lại mật khẩu", presentation: "modal" }}
          />
          <Stack.Screen
            name="EmailVerification"
            options={{ title: "Xác minh email" }}
          />
          <Stack.Screen
            name="AccountPending"
            options={{ title: "Tài khoản chờ duyệt" }}
          />
          {userProfile && String(userProfile.role) === "administrator" && (
            <Stack.Screen name="(admin)" />
          )}
          // Dành cho role teacher sau này: //{" "}
          {userProfile && String(userProfile.role) === "teacher" && (
            <Stack.Screen name="(teacher)" />
          )}
          // Dành cho role parent sau này: //{" "}
          {userProfile && String(userProfile.role) === "parent" && (
            <Stack.Screen name="(parent)" />
          )}
          {(!userProfile ||
            String(userProfile.role) !==
              "administrator" /*&& String(userProfile.role) !== "teacher" && String(userProfile.role) !== "parent"*/) && (
            <Stack.Screen name="(tabs)" />
          )}
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
