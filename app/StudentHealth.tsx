import { collection, getDocs, limit, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { db } from "../lib/firebase";

// Định nghĩa kiểu dữ liệu
interface HealthData {
  allergyDescription?: string;
  chronicDiseaseDescription?: string;
  declaredAt?: { seconds: number; nanoseconds: number };
  everHospitalized?: boolean;
  hospitalizationReason?: string;
  specialHealthNotes?: string;
  studentsId?: string;
  userId?: string;
  [key: string]: any;
}

interface UserProfile {
  linked_student_id?: string;
  role?: string;
  [key: string]: any;
}

const StudentHealth: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { userProfile } = useAuth() as { userProfile: UserProfile };
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        // Debug: Log tất cả thông tin
        console.log("=== DEBUGGING START ===");
        console.log("userProfile:", userProfile);
        console.log("typeof userProfile:", typeof userProfile);
        console.log(
          "userProfile keys:",
          userProfile ? Object.keys(userProfile) : "null"
        );

        // Chờ một chút nếu userProfile chưa load
        if (!userProfile) {
          console.log("UserProfile not loaded yet, waiting...");
          setTimeout(fetchHealthData, 500);
          return;
        }

        const studentId = userProfile.linked_student_id;
        console.log("Student ID from userProfile:", studentId);

        if (!studentId) {
          console.log("No linked_student_id found");
          setError("Không tìm thấy mã học sinh được liên kết");
          setLoading(false);
          return;
        }

        console.log("Fetching health data for studentId:", studentId);

        // Query đơn giản nhất
        const q = query(
          collection(db, "student_health_profiles"),
          where("studentsId", "==", studentId),
          limit(10)
        );

        console.log("Executing query...");
        const querySnapshot = await getDocs(q);

        console.log("Query result - size:", querySnapshot.size);
        console.log("Query result - empty:", querySnapshot.empty);

        if (!querySnapshot.empty) {
          // Lấy document đầu tiên
          const docs = querySnapshot.docs;
          const firstDoc = docs[0];
          const data = firstDoc.data() as HealthData;

          console.log("Found health data:", data);
          console.log("Setting healthData state...");

          setHealthData(data);
          setError(null);
        } else {
          console.log("No health data found");
          setHealthData(null);
          setError(null);
        }

        console.log("=== DEBUGGING END ===");
      } catch (error) {
        console.error("Error in fetchHealthData:", error);
        setError("Lỗi khi tải dữ liệu: " + (error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, [userProfile]);

  // Debug: Log current state
  console.log(
    "Current state - loading:",
    loading,
    "error:",
    error,
    "healthData:",
    !!healthData
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.debugText}>
            UserProfile: {JSON.stringify(userProfile, null, 2)}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!healthData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.noDataText}>Chưa có khai báo sức khỏe nào.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Thông tin sức khỏe học sinh</Text>

        <View style={styles.section}>
          <Text style={styles.label}>📅 Ngày khai báo:</Text>
          <Text style={styles.value}>
            {healthData.declaredAt
              ? new Date(
                  healthData.declaredAt.seconds * 1000
                ).toLocaleDateString("vi-VN")
              : "Không có thông tin"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>🤧 Dị ứng:</Text>
          <Text style={styles.value}>
            {healthData.allergyDescription || "Không có"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>💊 Bệnh mãn tính:</Text>
          <Text style={styles.value}>
            {healthData.chronicDiseaseDescription || "Không có"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>🏥 Đã từng nhập viện:</Text>
          <Text style={styles.value}>
            {healthData.everHospitalized ? "Có" : "Chưa"}
          </Text>
        </View>

        {healthData.everHospitalized && (
          <View style={styles.section}>
            <Text style={styles.label}>📋 Lý do nhập viện:</Text>
            <Text style={styles.value}>
              {healthData.hospitalizationReason || "Không có thông tin"}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>📝 Ghi chú sức khỏe:</Text>
          <Text style={styles.value}>
            {healthData.specialHealthNotes || "Không có"}
          </Text>
        </View>

        {/* Debug section
        <View style={styles.debugSection}>
          <Text style={styles.debugLabel}>Debug Info:</Text>
          <Text style={styles.debugText}>
            Student ID: {healthData.studentsId}
          </Text>
          <Text style={styles.debugText}>
            User Profile: {JSON.stringify(userProfile, null, 2)}
          </Text>
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f9ff",
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 24,
    textAlign: "center",
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#0f172a",
  },
  value: {
    fontSize: 16,
    color: "#334155",
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    lineHeight: 22,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 16,
  },
  noDataText: {
    fontSize: 18,
    color: "#6b7280",
    textAlign: "center",
  },
  debugSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  debugLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: "#6b7280",
    fontFamily: "monospace",
    lineHeight: 16,
  },
});

export default StudentHealth;
