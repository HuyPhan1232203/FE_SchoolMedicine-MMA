import { useRouter } from "expo-router";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MedicalColors } from "../constants/Colors";
import { useAuth } from "../hooks/useAuth";
import { db } from "../lib/firebase";

interface MedicineForm {
  studentId: string;
  medicineName: string;
  dosage: string;
  time: string;
  notes: string;
}

interface MedicineRequest {
  id: string;
  medicineName: string;
  dose: string;
  frequency: string;
  studentsId: string;
  note: string;
  startDate: string;
  endDate: string;
  status?: string;
  createdAt: any;
}

export default function MedicineDistribution() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<MedicineForm>({
    studentId: "",
    medicineName: "",
    dosage: "",
    time: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState<MedicineRequest[]>([]);
  const [fetching, setFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
    setFetching(true);
    try {
      let q = query(
        collection(db, "medicine_delivery_requests"),
        orderBy("createdAt", "desc")
      );
      // Nếu có userProfile.email thì lọc theo createdBy
      if (userProfile?.email) {
        q = query(
          collection(db, "medicine_delivery_requests"),
          where("createdBy", "==", userProfile.email),
          orderBy("createdAt", "desc")
        );
      }
      const querySnapshot = await getDocs(q);
      const data: MedicineRequest[] = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as MedicineRequest)
      );
      setRequests(data);
    } catch (e) {
      Alert.alert("Lỗi", "Không thể tải danh sách thuốc đã khai báo.");
    }
    setFetching(false);
  };

  useEffect(() => {
    if (!showForm) fetchRequests();
  }, [showForm]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  };

  const handleInputChange = (field: keyof MedicineForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.studentId || !form.medicineName || !form.dosage || !form.time) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "medicine_delivery_requests"), {
        studentId: form.studentId,
        medicineName: form.medicineName,
        dosage: form.dosage,
        time: form.time,
        notes: form.notes,
        createdBy: userProfile?.email || "",
        createdAt: new Date(),
      });
      Alert.alert(
        "Thành công",
        "Khai báo đưa thuốc đã được gửi. Vui lòng chờ xác nhận từ y tế trường!"
      );
      setShowForm(false);
      setForm({
        studentId: "",
        medicineName: "",
        dosage: "",
        time: "",
        notes: "",
      });
      fetchRequests();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi khai báo. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  if (showForm) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Khai báo Đưa Thuốc cho Học sinh</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Mã học sinh *</Text>
          <TextInput
            style={styles.input}
            value={form.studentId}
            onChangeText={(text) => handleInputChange("studentId", text)}
            placeholder="Nhập mã học sinh (VD: HS289)"
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tên thuốc *</Text>
          <TextInput
            style={styles.input}
            value={form.medicineName}
            onChangeText={(text) => handleInputChange("medicineName", text)}
            placeholder="Nhập tên thuốc"
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Liều lượng *</Text>
          <TextInput
            style={styles.input}
            value={form.dosage}
            onChangeText={(text) => handleInputChange("dosage", text)}
            placeholder="Nhập liều lượng (VD: 1 viên/ngày)"
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Thời gian sử dụng *</Text>
          <TextInput
            style={styles.input}
            value={form.time}
            onChangeText={(text) => handleInputChange("time", text)}
            placeholder="Nhập thời gian (VD: 8h sáng)"
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Ghi chú</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.notes}
            onChangeText={(text) => handleInputChange("notes", text)}
            placeholder="Ghi chú thêm (nếu có)"
            multiline
          />
        </View>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Đang gửi..." : "Gửi khai báo"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowForm(false)}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Hiển thị danh sách các lần đã khai báo đưa thuốc
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách thuốc đã khai báo</Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setShowForm(true)}
      >
        <Text style={styles.createButtonText}>+ Tạo đưa thuốc mới</Text>
      </TouchableOpacity>
      {fetching ? (
        <ActivityIndicator
          size="large"
          color={MedicalColors.primary}
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
              Chưa có khai báo nào.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.medicineName}>{item.medicineName}</Text>
              <Text style={styles.info}>
                Mã học sinh:{" "}
                <Text style={{ fontWeight: "bold" }}>{item.studentsId}</Text>
              </Text>
              <Text style={styles.info}>Liều lượng: {item.dose}</Text>
              <Text style={styles.info}>Tần suất: {item.frequency}</Text>
              <Text style={styles.info}>
                Thời gian: {item.startDate} - {item.endDate}
              </Text>
              {item.note ? (
                <Text style={styles.info}>Ghi chú: {item.note}</Text>
              ) : null}
              <Text style={styles.info}>
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
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: MedicalColors.backgroundSecondary,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    textAlign: "center",
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: MedicalColors.textPrimary,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: MedicalColors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: MedicalColors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: MedicalColors.border,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 10,
    padding: 10,
    alignItems: "center",
  },
  backButtonText: {
    color: MedicalColors.accent,
    fontSize: 16,
  },
  createButton: {
    backgroundColor: MedicalColors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
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
    color: MedicalColors.primary,
    marginBottom: 2,
  },
  info: {
    color: "#444",
    marginBottom: 4,
    fontSize: 15,
  },
});
