import { addDoc, collection } from "firebase/firestore";
import React, { useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { db } from "../lib/firebase";

export default function ReportStudentHealth() {
  const { user, userProfile } = useAuth();
  const [allergy, setAllergy] = useState("");
  const [chronic, setChronic] = useState("");
  const [everHospitalized, setEverHospitalized] = useState(false);
  const [hospitalReason, setHospitalReason] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Lấy studentsId từ userProfile nếu có
  const studentsId = (userProfile as any)?.linked_student_id || "";
  const userId = user?.uid || "";

  const handleSubmit = async () => {
    console.log("[DEBUG] studentsId:", studentsId, "userId:", userId);
    if (!studentsId) {
      Alert.alert(
        "Thiếu thông tin",
        "Không tìm thấy mã học sinh. Vui lòng kiểm tra lại tài khoản."
      );
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "student_health_profiles"), {
        allergyDescription: allergy,
        chronicDiseaseDescription: chronic,
        everHospitalized,
        hospitalizationReason: hospitalReason,
        specialHealthNotes: specialNotes,
        declaredAt: new Date(),
        studentsId,
        userId,
      });
      console.log("[DEBUG] Gửi khai báo thành công!");
      Alert.alert("Thành công", "Khai báo sức khỏe đã được gửi!");
      setAllergy("");
      setChronic("");
      setEverHospitalized(false);
      setHospitalReason("");
      setSpecialNotes("");
    } catch (e) {
      console.error("[ERROR] Lỗi gửi khai báo:", e);
      let errorMsg = "";
      if (e instanceof Error) errorMsg = e.message;
      Alert.alert("Lỗi", "Không thể gửi khai báo!\n" + errorMsg);
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Khai báo tình trạng sức khỏe học sinh</Text>
      <Text style={styles.label}>Dị ứng:</Text>
      <TextInput
        value={allergy}
        onChangeText={setAllergy}
        style={styles.input}
        placeholder="Nhập dị ứng (nếu có)"
      />
      <Text style={styles.label}>Bệnh mãn tính:</Text>
      <TextInput
        value={chronic}
        onChangeText={setChronic}
        style={styles.input}
        placeholder="Nhập bệnh mãn tính (nếu có)"
      />
      <View style={styles.switchRow}>
        <Text style={styles.label}>Đã từng nhập viện?</Text>
        <Switch value={everHospitalized} onValueChange={setEverHospitalized} />
      </View>
      <Text style={styles.label}>Lý do nhập viện:</Text>
      <TextInput
        value={hospitalReason}
        onChangeText={setHospitalReason}
        style={styles.input}
        placeholder="Nhập lý do nhập viện (nếu có)"
      />
      <Text style={styles.label}>Ghi chú sức khỏe đặc biệt:</Text>
      <TextInput
        value={specialNotes}
        onChangeText={setSpecialNotes}
        style={styles.input}
        placeholder="Nhập ghi chú đặc biệt (nếu có)"
      />
      <Button
        title={loading ? "Đang gửi..." : "Gửi khai báo"}
        onPress={handleSubmit}
        disabled={loading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#F8FAFC",
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2563eb",
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 6,
    marginTop: 12,
    color: "#22223b",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
});
