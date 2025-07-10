import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../hooks/useAuth";

export default function Index() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user && userProfile) {
        if (userProfile.role === "administrator") {
          router.replace("/(admin)/Dashboard");
        } else {
          router.replace("/(tabs)/Home");
        }
      } else {
        router.replace("/Login");
      }
    }
  }, [user, userProfile, loading, router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
