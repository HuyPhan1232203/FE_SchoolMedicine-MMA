import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MedicalColors, MedicalIcons } from "../../constants/Colors";
import {
  addMedicalDevice,
  deleteMedicalDevice,
  getMedicalDevices,
  MedicalDevice,
  updateMedicalDevice,
} from "../../services/medicalDeviceService";

function StatusBadge({ status }: { status: string }) {
  return (
    <Text
      style={[
        styles.statusBadge,
        {
          color:
            status === "available"
              ? MedicalColors.success
              : MedicalColors.error,
          backgroundColor: status === "available" ? "#E8F8F5" : "#FDEDEC",
        },
      ]}
    >
      {status === "available" ? "🟢" : "🔴"} {status}
    </Text>
  );
}

const emptyDevice = {
  deviceCode: "",
  deviceName: "",
  lastChecked: null,
  rental: "",
  quantity: 1,
  status: "available",
  kind: "",
  unit: "cái",
};

export default function MedicalTools() {
  const [devices, setDevices] = useState<(MedicalDevice & { id: string })[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyDevice);
  const [formLoading, setFormLoading] = useState(false);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const data = await getMedicalDevices();
      setDevices(data as (MedicalDevice & { id: string })[]);
    } catch (error) {
      // handle error
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDevices();
    setRefreshing(false);
  };

  const openAddModal = () => {
    setEditId(null);
    setForm(emptyDevice);
    setModalVisible(true);
  };

  const openEditModal = (device: any) => {
    setEditId(device.id);
    setForm({ ...device });
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa thiết bị này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          await deleteMedicalDevice(id);
          fetchDevices();
        },
      },
    ]);
  };

  const handleSubmit = async () => {
    setFormLoading(true);
    try {
      if (editId) {
        await updateMedicalDevice(editId, form);
      } else {
        await addMedicalDevice(form);
      }
      setModalVisible(false);
      fetchDevices();
    } catch (e) {
      // handle error
    }
    setFormLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={MedicalColors.primary} />
        <Text style={styles.loadingText}>
          Đang tải danh sách dụng cụ y tế...
        </Text>
      </View>
    );
  }

  if (!devices.length) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>
          Không có dụng cụ y tế nào trong hệ thống.
        </Text>
        <TouchableOpacity style={styles.reloadButton} onPress={fetchDevices}>
          <Text style={styles.reloadButtonText}>🔄 Tải lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {MedicalIcons.medicine} Danh sách dụng cụ y tế
      </Text>
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>
              Không có dụng cụ y tế nào trong hệ thống.
            </Text>
            <TouchableOpacity
              style={styles.reloadButton}
              onPress={fetchDevices}
            >
              <Text style={styles.reloadButtonText}>🔄 Tải lại</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.deviceName}>{item.deviceName}</Text>
              <StatusBadge status={item.status} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.info}>
                <Text style={styles.label}>Mã:</Text> {item.deviceCode}
              </Text>
              <Text style={styles.info}>
                <Text style={styles.label}>Loại:</Text> {item.kind}
              </Text>
              <Text style={styles.info}>
                <Text style={styles.label}>Số lượng:</Text> {item.quantity}{" "}
                {item.unit}
              </Text>
              <Text style={styles.info}>
                <Text style={styles.label}>Vị trí:</Text> {item.rental}
              </Text>
              <Text style={styles.info}>
                <Text style={styles.label}>Lần kiểm tra cuối:</Text>{" "}
                {item.lastChecked
                  ? new Date(item.lastChecked.seconds * 1000).toLocaleString()
                  : "-"}
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
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editId ? "Sửa dụng cụ" : "Thêm dụng cụ mới"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Tên dụng cụ"
              value={form.deviceName}
              onChangeText={(t) =>
                setForm((f: any) => ({ ...f, deviceName: t }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Mã dụng cụ"
              value={form.deviceCode}
              onChangeText={(t) =>
                setForm((f: any) => ({ ...f, deviceCode: t }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Loại"
              value={form.kind}
              onChangeText={(t) => setForm((f: any) => ({ ...f, kind: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Số lượng"
              keyboardType="numeric"
              value={form.quantity?.toString()}
              onChangeText={(t) =>
                setForm((f: any) => ({ ...f, quantity: parseInt(t) || 0 }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Đơn vị"
              value={form.unit}
              onChangeText={(t) => setForm((f: any) => ({ ...f, unit: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Vị trí (Phòng, tủ...)"
              value={form.rental}
              onChangeText={(t) => setForm((f: any) => ({ ...f, rental: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Trạng thái (available/unavailable)"
              value={form.status}
              onChangeText={(t) => setForm((f: any) => ({ ...f, status: t }))}
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
  deviceName: {
    fontSize: 18,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    fontSize: 14,
    fontWeight: "bold",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
    overflow: "hidden",
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
