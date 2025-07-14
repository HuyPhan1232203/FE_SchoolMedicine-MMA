import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { db } from "../../lib/firebase";

interface MedicineRequest {
  id: string;
  medicineName: string;
  dosage: string;
  studentId: string;
  time: string;
  notes?: string;
  status: string;
  createdBy?: string;
  createdAt?: any;
  confirmedBy?: string;
  confirmedAt?: string;
}

export default function MedicineDistribution() {
  const { userProfile } = useAuth();
  const [requests, setRequests] = useState<MedicineRequest[]>([]);
  const [fetching, setFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
    setFetching(true);
    try {
      const q = query(
        collection(db, "medicine_delivery_requests"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const data: MedicineRequest[] = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as MedicineRequest)
      );
      setRequests(data);
    } catch (e) {
      Alert.alert("Lỗi", "Không thể tải danh sách giao thuốc.");
    }
    setFetching(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  };

  const handleConfirm = async (id: string) => {
    try {
      await updateDoc(doc(db, "medicine_delivery_requests", id), {
        status: "confirmed",
        confirmedBy: userProfile?.email || "",
        confirmedAt: new Date().toISOString(),
      });
      Alert.alert("Thành công", "Đã xác nhận giao thuốc!");
      fetchRequests();
    } catch (e) {
      Alert.alert("Lỗi", "Không thể xác nhận giao thuốc.");
    }
  };

  if (userProfile?.role !== "medical_staff") {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.noPermissionText}>
          Bạn không có quyền quản lý giao thuốc.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      <Text style={styles.title}>Danh sách yêu cầu giao thuốc</Text>
      {fetching ? (
        <ActivityIndicator
          size="large"
          color="#1976d2"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: "#888", marginTop: 32 }}>
              Chưa có yêu cầu giao thuốc nào.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.medicineName}>{item.medicineName}</Text>
              <Text style={styles.info}>
                Học sinh:{" "}
                <Text style={{ fontWeight: "bold" }}>{item.studentId}</Text>
              </Text>
              <Text style={styles.info}>Liều dùng: {item.dosage}</Text>
              <Text style={styles.info}>Tần suất: -</Text>
              <Text style={styles.info}>Thời gian: {item.time || "-"}</Text>
              {item.notes ? (
                <Text style={styles.info}>Ghi chú: {item.notes}</Text>
              ) : null}
              <Text style={styles.status}>
                Trạng thái:{" "}
                <Text style={{ fontWeight: "bold" }}>
                  {item.status === "pending" ? "Chờ xác nhận" : "Đã xác nhận"}
                </Text>
              </Text>
              {item.status === "pending" && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleConfirm(item.id)}
                >
                  <Text style={styles.buttonText}>Xác nhận đã giao</Text>
                </TouchableOpacity>
              )}
              {item.status === "confirmed" && item.confirmedBy && (
                <Text style={styles.confirmedBy}>
                  Người xác nhận: {item.confirmedBy}
                </Text>
              )}
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    backgroundColor: "#f4f6fa",
    padding: 16,
    paddingTop: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a237e",
    marginBottom: 18,
    textAlign: "left",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: 2,
  },
  info: {
    color: "#444",
    marginBottom: 4,
    fontSize: 15,
  },
  status: {
    color: "#b71c1c",
    fontSize: 15,
    marginTop: 6,
    marginBottom: 6,
  },
  button: {
    backgroundColor: "#1976d2",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
  confirmedBy: {
    color: "#388e3c",
    fontSize: 14,
    marginTop: 6,
    fontStyle: "italic",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6fa",
  },
  noPermissionText: {
    fontSize: 18,
    color: "#b71c1c",
    fontWeight: "600",
    textAlign: "center",
    padding: 24,
  },
});
