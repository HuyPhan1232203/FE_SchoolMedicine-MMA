import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { db } from "../../lib/firebase";

interface Vaccine {
  id: string;
  vaccineName: string;
  description: string;
  doses: number;
  recommendedAges: string;
  sideEffects: string;
  createdAt: any;
}

export default function Vaccination() {
  const { userProfile } = useAuth();
  const [form, setForm] = useState({
    vaccineName: "",
    description: "",
    doses: "",
    recommendedAges: "",
    sideEffects: "",
  });
  const [loading, setLoading] = useState(false);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [fetching, setFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleChange = (key: string, value: string) =>
    setForm({ ...form, [key]: value });

  const fetchVaccines = async () => {
    setFetching(true);
    try {
      const q = query(collection(db, "vaccines"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data: Vaccine[] = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Vaccine)
      );
      setVaccines(data);
    } catch (e) {
      Alert.alert("Lỗi", "Không thể tải danh sách vaccine.");
    }
    setFetching(false);
  };

  useEffect(() => {
    fetchVaccines();
  }, []);

  const handleSubmit = async () => {
    if (!form.vaccineName || !form.doses) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng nhập đầy đủ tên vaccine và số mũi."
      );
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "vaccines"), {
        vaccineName: form.vaccineName,
        description: form.description,
        doses: Number(form.doses),
        recommendedAges: form.recommendedAges,
        sideEffects: form.sideEffects,
        createdAt: new Date(),
      });
      Alert.alert("Thành công", "Đã khai báo vaccine mới!");
      setForm({
        vaccineName: "",
        description: "",
        doses: "",
        recommendedAges: "",
        sideEffects: "",
      });
      setShowForm(false);
      fetchVaccines();
    } catch (e) {
      Alert.alert("Lỗi", "Không thể khai báo vaccine.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVaccines();
    setRefreshing(false);
  };

  if (userProfile?.role !== "medical_staff") {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.noPermissionText}>
          Bạn không có quyền khai báo vaccine.
        </Text>
      </View>
    );
  }

  if (showForm) {
    return (
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Khai báo vaccine mới</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên vaccine *</Text>
            <TextInput
              placeholder="Nhập tên vaccine"
              value={form.vaccineName}
              onChangeText={(v) => handleChange("vaccineName", v)}
              style={styles.input}
              placeholderTextColor="#aaa"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mô tả</Text>
            <TextInput
              placeholder="Mô tả ngắn về vaccine"
              value={form.description}
              onChangeText={(v) => handleChange("description", v)}
              style={styles.input}
              placeholderTextColor="#aaa"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số mũi *</Text>
            <TextInput
              placeholder="Nhập số mũi tiêm"
              value={form.doses}
              onChangeText={(v) => handleChange("doses", v)}
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor="#aaa"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Độ tuổi khuyến nghị</Text>
            <TextInput
              placeholder="Ví dụ: Từ sơ sinh đến 12 tháng"
              value={form.recommendedAges}
              onChangeText={(v) => handleChange("recommendedAges", v)}
              style={styles.input}
              placeholderTextColor="#aaa"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tác dụng phụ</Text>
            <TextInput
              placeholder="Ví dụ: Đau chỗ tiêm, sốt nhẹ"
              value={form.sideEffects}
              onChangeText={(v) => handleChange("sideEffects", v)}
              style={styles.input}
              placeholderTextColor="#aaa"
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            <TouchableOpacity
              style={[
                styles.button,
                { flex: 1, marginRight: 8, backgroundColor: "#bdbdbd" },
              ]}
              onPress={() => setShowForm(false)}
              disabled={loading}
            >
              <Text style={styles.buttonText}>HỦY</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { flex: 1 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Đang lưu..." : "KHAI BÁO"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.listContainer}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text style={styles.title}>Danh sách vaccine đã khai báo</Text>
        <TouchableOpacity
          style={[
            styles.button,
            { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
          ]}
          onPress={() => setShowForm(true)}
        >
          <Text style={styles.buttonText}>+ Tạo khai báo mới</Text>
        </TouchableOpacity>
      </View>
      {fetching ? (
        <ActivityIndicator
          size="large"
          color="#1976d2"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={vaccines}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: "#888", marginTop: 32 }}>
              Chưa có vaccine nào được khai báo.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.vaccineCard}>
              <Text style={styles.vaccineName}>{item.vaccineName}</Text>
              <Text style={styles.vaccineDesc}>{item.description}</Text>
              <View
                style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 6 }}
              >
                <Text style={styles.vaccineInfo}>
                  Số mũi:{" "}
                  <Text style={{ fontWeight: "bold" }}>{item.doses}</Text>
                </Text>
                {item.recommendedAges ? (
                  <Text style={styles.vaccineInfo}>
                    {" "}
                    | Độ tuổi:{" "}
                    <Text style={{ fontWeight: "bold" }}>
                      {item.recommendedAges}
                    </Text>
                  </Text>
                ) : null}
              </View>
              {item.sideEffects ? (
                <Text style={styles.vaccineInfo}>
                  Tác dụng phụ:{" "}
                  <Text style={{ fontWeight: "bold" }}>{item.sideEffects}</Text>
                </Text>
              ) : null}
              <Text style={styles.vaccineDate}>
                Ngày khai báo:{" "}
                {item.createdAt?.toDate
                  ? item.createdAt.toDate().toLocaleString()
                  : "-"}
              </Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6fa",
    paddingVertical: 32,
    paddingHorizontal: 12,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    marginTop: Platform.OS === "web" ? 32 : 0,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a237e",
    marginBottom: 18,
    textAlign: "left",
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: "#263238",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: "#f9fafb",
    color: "#222",
  },
  button: {
    backgroundColor: "#1976d2",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 0,
    shadowColor: "#1976d2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
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
  listContainer: {
    flex: 1,
    backgroundColor: "#f4f6fa",
    padding: 16,
    paddingTop: 32,
  },
  vaccineCard: {
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
  vaccineName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: 2,
  },
  vaccineDesc: {
    color: "#444",
    marginBottom: 4,
    fontSize: 15,
  },
  vaccineInfo: {
    color: "#333",
    fontSize: 14,
    marginRight: 8,
  },
  vaccineDate: {
    color: "#888",
    fontSize: 13,
    marginTop: 6,
    fontStyle: "italic",
  },
});
