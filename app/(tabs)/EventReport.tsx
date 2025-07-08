import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker"; // Cài: npm i @react-native-picker/picker
import { collection, getDocs, Timestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MedicalColors, MedicalIcons } from "../../constants/Colors";
import { db } from "../../lib/firebase"; // Đường dẫn đúng tới firebase config
import {
  addMedicalEvent,
  deleteMedicalEvent,
  getMedicalEvents,
  MedicalEvent,
  updateMedicalEvent,
} from "../../services/medicalEventService";

const emptyEvent = {
  eventType: "",
  description: "",
  eventTime: "",
  fullName: "",
  grade: "",
  notes: "",
  reportedBy: "",
  studentId: "",
};

export default function EventReport() {
  const [events, setEvents] = useState<(MedicalEvent & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyEvent);
  const [formLoading, setFormLoading] = useState(false);
  // Thêm state để điều khiển picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [students, setStudents] = useState<any[]>([]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getMedicalEvents();
      console.log("Fetched events:", data);
      setEvents(data as (MedicalEvent & { id: string })[]);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      const querySnapshot = await getDocs(collection(db, "students"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(data);
    };
    fetchStudents();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const openAddModal = () => {
    setEditId(null);
    setForm(emptyEvent);
    setModalVisible(true);
  };

  const openEditModal = (event: any) => {
    setEditId(event.id);
    setForm({
      ...event,
      eventTime: event.eventTime?.seconds
        ? new Date(event.eventTime.seconds * 1000).toISOString().slice(0, 16)
        : "",
    });
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa sự kiện này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          await deleteMedicalEvent(id);
          fetchEvents();
        },
      },
    ]);
  };

  const handleSubmit = async () => {
    setFormLoading(true);
    try {
      let eventData = { ...form };
      // Chuyển eventTime sang Timestamp nếu là string
      if (form.eventTime && typeof form.eventTime === "string") {
        eventData.eventTime = Timestamp.fromDate(new Date(form.eventTime));
      }
      if (editId) {
        await updateMedicalEvent(editId, eventData);
      } else {
        await addMedicalEvent(eventData);
      }
      setModalVisible(false);
      fetchEvents();
    } catch (e) {}
    setFormLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={MedicalColors.primary} />
        <Text style={styles.loadingText}>
          Đang tải danh sách sự kiện y tế...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {MedicalIcons.alert} Danh sách sự kiện y tế
      </Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>
              Chưa có sự kiện y tế nào được khai báo.
            </Text>
            <TouchableOpacity style={styles.reloadButton} onPress={fetchEvents}>
              <Text style={styles.reloadButtonText}>🔄 Tải lại</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.eventType}>{item.eventType}</Text>
              <Text style={styles.eventTime}>
                {item.eventTime
                  ? new Date(item.eventTime.seconds * 1000).toLocaleString()
                  : "-"}
              </Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.info}>
                <Text style={styles.label}>Mô tả:</Text> {item.description}
              </Text>
              <Text style={styles.info}>
                <Text style={styles.label}>Học sinh:</Text> {item.fullName} (
                {item.studentId})
              </Text>
              <Text style={styles.info}>
                <Text style={styles.label}>Lớp:</Text> {item.grade}
              </Text>
              <Text style={styles.info}>
                <Text style={styles.label}>Người báo cáo:</Text>{" "}
                {item.reportedBy}
              </Text>
              <Text style={styles.info}>
                <Text style={styles.label}>Ghi chú:</Text> {item.notes}
              </Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => openEditModal(item)}
              >
                <Text style={styles.editBtnText}>✏️ Sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.deleteBtnText}>🗑️ Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>
      {/* Modal Form */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editId ? "Sửa sự kiện" : "Khai báo sự kiện mới"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Loại sự kiện (VD: Chấn thương, Tai nạn, ... )"
              value={form.eventType}
              onChangeText={(t) =>
                setForm((f: any) => ({ ...f, eventType: t }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Mô tả sự kiện"
              value={form.description}
              onChangeText={(t) =>
                setForm((f: any) => ({ ...f, description: t }))
              }
            />
            {Platform.OS === "web" ? (
              <input
                type="datetime-local"
                className="rnweb-input"
                style={{
                  ...styles.input,
                  padding: 12,
                  fontSize: 16,
                  borderRadius: 10,
                  borderWidth: 1.5,
                  borderColor: MedicalColors.inputBorder,
                  marginBottom: 12,
                  width: "100%",
                }}
                value={form.eventTime ? form.eventTime.slice(0, 16) : ""}
                onChange={(e) =>
                  setForm((f: any) => ({
                    ...f,
                    eventTime: e.target.value,
                  }))
                }
              />
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={[styles.input, { justifyContent: "center" }]}
                >
                  <Text style={{ color: form.eventTime ? "#000" : "#888" }}>
                    {form.eventTime
                      ? new Date(form.eventTime).toLocaleString()
                      : "Chọn thời gian sự kiện"}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={
                      form.eventTime ? new Date(form.eventTime) : new Date()
                    }
                    mode="datetime"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setForm((f: any) => ({
                          ...f,
                          eventTime: selectedDate.toISOString(),
                        }));
                      }
                    }}
                  />
                )}
              </>
            )}
            <Picker
              selectedValue={form.studentId}
              onValueChange={(studentId) => {
                const selected = students.find((s) => s.id === studentId);
                setForm((f: any) => ({
                  ...f,
                  studentId,
                  fullName: selected?.fullName || "",
                  grade: selected?.grade || "",
                }));
              }}
              style={styles.input}
            >
              <Picker.Item label="Chọn mã học sinh" value="" />
              {students.map((student) => (
                <Picker.Item
                  key={student.id}
                  label={student.id}
                  value={student.id}
                />
              ))}
            </Picker>
            <TextInput
              style={styles.input}
              placeholder="Họ tên học sinh"
              value={form.fullName}
              editable={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Lớp"
              value={form.grade}
              editable={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Người báo cáo"
              value={form.reportedBy}
              onChangeText={(t) =>
                setForm((f: any) => ({ ...f, reportedBy: t }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Ghi chú"
              value={form.notes}
              onChangeText={(t) => setForm((f: any) => ({ ...f, notes: t }))}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSubmit}
                disabled={formLoading}
              >
                <Text style={styles.saveBtnText}>
                  {formLoading ? "Đang lưu..." : "Lưu"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MedicalColors.backgroundSecondary,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: MedicalColors.primary,
    marginBottom: 18,
    textAlign: "center",
  },
  card: {
    backgroundColor: MedicalColors.backgroundCard,
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  eventType: {
    fontSize: 18,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    flex: 1,
  },
  eventTime: {
    fontSize: 14,
    color: MedicalColors.textMuted,
    marginLeft: 8,
  },
  cardBody: {
    marginTop: 4,
  },
  info: {
    fontSize: 15,
    color: MedicalColors.textSecondary,
    marginBottom: 2,
  },
  label: {
    fontWeight: "600",
    color: MedicalColors.textPrimary,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 8,
  },
  editBtn: {
    backgroundColor: MedicalColors.info,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
  },
  editBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  deleteBtn: {
    backgroundColor: MedicalColors.error,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    backgroundColor: MedicalColors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: MedicalColors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: MedicalColors.backgroundSecondary,
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: MedicalColors.textSecondary,
  },
  emptyText: {
    fontSize: 17,
    color: MedicalColors.textMuted,
    marginBottom: 18,
    textAlign: "center",
  },
  reloadButton: {
    backgroundColor: MedicalColors.primary,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  reloadButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    shadowColor: MedicalColors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: MedicalColors.primary,
    marginBottom: 18,
    textAlign: "center",
  },
  input: {
    borderWidth: 1.5,
    borderColor: MedicalColors.inputBorder,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: MedicalColors.inputBackground,
    color: MedicalColors.textPrimary,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 10,
  },
  cancelBtn: {
    backgroundColor: MedicalColors.textMuted,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 8,
  },
  cancelBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: MedicalColors.primary,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});
