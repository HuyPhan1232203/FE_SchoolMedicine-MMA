import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MedicalColors } from "../constants/Colors";
import { useAuth } from "../hooks/useAuth";

interface MedicineForm {
  studentId: string;
  medicineName: string;
  dosage: string;
  time: string;
  notes: string;
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
      // Giả lập gửi dữ liệu đến backend (thay bằng API call thực tế)
      console.log("Submitting medicine data:", form);
      Alert.alert(
        "Thành công",
        "Khai báo đưa thuốc đã được gửi. Vui lòng chờ xác nhận từ y tế trường!",
        [{ text: "OK", onPress: () => router.push("/Home") }]
      );
    } catch (error) {
      console.error("Error submitting medicine data:", error);
      Alert.alert("Lỗi", "Không thể gửi khai báo. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

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
        onPress={() => router.push("/Home")}
      >
        <Text style={styles.backButtonText}>Quay lại</Text>
      </TouchableOpacity>
    </ScrollView>
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
});
