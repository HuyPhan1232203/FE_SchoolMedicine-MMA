// Initialize Firebase first
import '../lib/firebase';

import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
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
  const { user, loading } = useAuth();

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
        <Stack>
          {!user ? (
            <>
              <Stack.Screen 
                name="Login" 
                options={{ 
                  title: "Đăng nhập",
                  headerShown: false 
                }} 
              />
              <Stack.Screen 
                name="Register" 
                options={{ 
                  title: "Đăng ký",
                  headerShown: false 
                }} 
              />
              <Stack.Screen 
                name="ResetPassword" 
                options={{ 
                  title: "Đặt lại mật khẩu",
                  presentation: "modal" 
                }} 
              />
              <Stack.Screen 
                name="EmailVerification" 
                options={{ 
                  title: "Xác minh email",
                  headerShown: false
                }} 
              />
            </>
          ) : (
            <>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </>
          )}
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
