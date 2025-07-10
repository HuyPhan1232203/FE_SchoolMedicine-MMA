import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CustomHeader from "../../components/CustomHeader";
import { MedicalColors, MedicalIcons } from "../../constants/Colors";
import { useAuth } from "../../hooks/useAuth";

const { width } = Dimensions.get("window");

interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  dosage: string;
  form: string; // tablet, syrup, injection, etc.
  stockQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  unit: string;
  price: number;
  expiryDate: string;
  batchNumber: string;
  status: "available" | "low_stock" | "out_of_stock" | "expired";
  description?: string;
  sideEffects?: string;
  contraindications?: string;
  storage?: string;
  createdAt: string;
  updatedAt: string;
}

interface MedicineUsage {
  id: string;
  medicineId: string;
  medicineName: string;
  studentId: string;
  studentName: string;
  grade: string;
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
  prescribedBy: string;
  givenBy: string;
  reason: string;
  usageDate: string;
  status: "prescribed" | "dispensed" | "completed";
  notes?: string;
}

export default function DrugManagement() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [usageHistory, setUsageHistory] = useState<MedicineUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "available" | "low_stock" | "out_of_stock" | "expired"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "analgesic" | "antibiotic" | "antiseptic" | "vitamin" | "other"
  >("all");
  const [activeTab, setActiveTab] = useState<"inventory" | "usage">(
    "inventory"
  );
  const { userProfile } = useAuth();

  // New medicine form state
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    genericName: "",
    category: "",
    manufacturer: "",
    dosage: "",
    form: "",
    stockQuantity: "",
    minStockLevel: "",
    maxStockLevel: "",
    unit: "",
    price: "",
    expiryDate: "",
    batchNumber: "",
    description: "",
    sideEffects: "",
    contraindications: "",
    storage: "",
  });

  // Medicine usage form state
  const [newUsage, setNewUsage] = useState({
    medicineId: "",
    studentId: "",
    studentName: "",
    grade: "",
    quantity: "",
    dosage: "",
    frequency: "",
    duration: "",
    prescribedBy: "",
    reason: "",
    notes: "",
  });

  useEffect(() => {
    if (userProfile && userProfile.role !== "administrator") {
      router.replace("/Login");
    }
  }, [userProfile]);

  // Mock data
  const mockMedicines: Medicine[] = [
    {
      id: "1",
      name: "Paracetamol",
      genericName: "Acetaminophen",
      category: "analgesic",
      manufacturer: "Traphaco",
      dosage: "500mg",
      form: "tablet",
      stockQuantity: 150,
      minStockLevel: 50,
      maxStockLevel: 500,
      unit: "viên",
      price: 500,
      expiryDate: "2025-12-31",
      batchNumber: "PCT-2024-001",
      status: "available",
      description: "Thuốc giảm đau, hạ sốt",
      sideEffects: "Ít tác dụng phụ khi dùng đúng liều",
      contraindications: "Không dùng cho người dị ứng với paracetamol",
      storage: "Nơi khô ráo, thoáng mát",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Betadine",
      genericName: "Povidone Iodine",
      category: "antiseptic",
      manufacturer: "Mundipharma",
      dosage: "10%",
      form: "solution",
      stockQuantity: 25,
      minStockLevel: 30,
      maxStockLevel: 100,
      unit: "chai",
      price: 35000,
      expiryDate: "2025-06-30",
      batchNumber: "BET-2024-002",
      status: "low_stock",
      description: "Dung dịch sát khuẩn",
      sideEffects: "Có thể gây kích ứng da nhẹ",
      contraindications: "Không dùng cho người dị ứng iodine",
      storage: "Tránh ánh sáng trực tiếp",
      createdAt: "2024-01-02",
      updatedAt: "2024-01-16",
    },
    {
      id: "3",
      name: "Vitamin C",
      genericName: "Ascorbic Acid",
      category: "vitamin",
      manufacturer: "Dhg Pharma",
      dosage: "1000mg",
      form: "tablet",
      stockQuantity: 0,
      minStockLevel: 100,
      maxStockLevel: 1000,
      unit: "viên",
      price: 200,
      expiryDate: "2024-03-31",
      batchNumber: "VTC-2023-003",
      status: "out_of_stock",
      description: "Vitamin C tăng cường sức đề kháng",
      sideEffects: "Có thể gây rối loạn tiêu hóa khi dùng quá liều",
      contraindications: "Không dùng cho người sỏi thận",
      storage: "Nơi khô ráo, nhiệt độ thường",
      createdAt: "2024-01-03",
      updatedAt: "2024-01-17",
    },
  ];

  const mockUsageHistory: MedicineUsage[] = [
    {
      id: "1",
      medicineId: "1",
      medicineName: "Paracetamol",
      studentId: "HS001",
      studentName: "Nguyễn Văn An",
      grade: "10A1",
      quantity: 2,
      dosage: "500mg",
      frequency: "2 lần/ngày",
      duration: "3 ngày",
      prescribedBy: "Bác sĩ Lê Thị C",
      givenBy: "Y tá Nguyễn Thị A",
      reason: "Sốt cao",
      usageDate: "2024-01-15",
      status: "completed",
      notes: "Đã hết sốt sau 2 ngày",
    },
    {
      id: "2",
      medicineId: "2",
      medicineName: "Betadine",
      studentId: "HS002",
      studentName: "Trần Thị Bình",
      grade: "11A2",
      quantity: 1,
      dosage: "10%",
      frequency: "3 lần/ngày",
      duration: "5 ngày",
      prescribedBy: "Y tá Trần Văn B",
      givenBy: "Y tá Trần Văn B",
      reason: "Vết thương nhỏ",
      usageDate: "2024-01-16",
      status: "dispensed",
      notes: "Rửa vết thương và băng bó",
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Filter medicines based on search query, status, and category
    let filtered = medicines;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (medicine) =>
          medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          medicine.genericName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          medicine.manufacturer
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (medicine) => medicine.status === statusFilter
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (medicine) => medicine.category === categoryFilter
      );
    }

    setFilteredMedicines(filtered);
  }, [medicines, searchQuery, statusFilter, categoryFilter]);

  const loadData = async () => {
    try {
      setMedicines(mockMedicines);
      setFilteredMedicines(mockMedicines);
      setUsageHistory(mockUsageHistory);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu thuốc");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return MedicalColors.success;
      case "low_stock":
        return MedicalColors.warning;
      case "out_of_stock":
        return MedicalColors.error;
      case "expired":
        return "#8B0000";
      default:
        return MedicalColors.textMuted;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Có sẵn";
      case "low_stock":
        return "Sắp hết";
      case "out_of_stock":
        return "Hết hàng";
      case "expired":
        return "Hết hạn";
      default:
        return "Không xác định";
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case "analgesic":
        return "Thuốc giảm đau";
      case "antibiotic":
        return "Thuốc kháng sinh";
      case "antiseptic":
        return "Thuốc sát khuẩn";
      case "vitamin":
        return "Vitamin";
      case "other":
        return "Khác";
      default:
        return "Không xác định";
    }
  };

  const handleAddMedicine = () => {
    if (
      !newMedicine.name ||
      !newMedicine.stockQuantity ||
      !newMedicine.unit ||
      !newMedicine.expiryDate
    ) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    Alert.alert("Xác nhận", "Thêm thuốc mới vào kho?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Thêm",
        onPress: () => {
          Alert.alert("Thành công", "Đã thêm thuốc mới vào kho");
          setShowAddModal(false);
          resetNewMedicineForm();
        },
      },
    ]);
  };

  const handleAddUsage = () => {
    if (
      !newUsage.medicineId ||
      !newUsage.studentId ||
      !newUsage.quantity ||
      !newUsage.reason
    ) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    Alert.alert("Xác nhận", "Ghi nhận việc sử dụng thuốc?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Ghi nhận",
        onPress: () => {
          Alert.alert("Thành công", "Đã ghi nhận việc sử dụng thuốc");
          setShowUsageModal(false);
          resetNewUsageForm();
        },
      },
    ]);
  };

  const resetNewMedicineForm = () => {
    setNewMedicine({
      name: "",
      genericName: "",
      category: "",
      manufacturer: "",
      dosage: "",
      form: "",
      stockQuantity: "",
      minStockLevel: "",
      maxStockLevel: "",
      unit: "",
      price: "",
      expiryDate: "",
      batchNumber: "",
      description: "",
      sideEffects: "",
      contraindications: "",
      storage: "",
    });
  };

  const resetNewUsageForm = () => {
    setNewUsage({
      medicineId: "",
      studentId: "",
      studentName: "",
      grade: "",
      quantity: "",
      dosage: "",
      frequency: "",
      duration: "",
      prescribedBy: "",
      reason: "",
      notes: "",
    });
  };

  const renderMedicineItem = ({ item }: { item: Medicine }) => (
    <TouchableOpacity
      style={[
        styles.medicineCard,
        { borderLeftColor: getStatusColor(item.status) },
      ]}
      onPress={() => {
        setSelectedMedicine(item);
        setShowDetailModal(true);
      }}
    >
      <View style={styles.medicineHeader}>
        <View style={styles.medicineHeaderLeft}>
          <Text style={styles.medicineName}>{item.name}</Text>
          <Text style={styles.medicineGeneric}>{item.genericName}</Text>
        </View>
        <View style={styles.medicineHeaderRight}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.medicineInfo}>
        <Text style={styles.medicineDetail}>
          {getCategoryText(item.category)} • {item.dosage} • {item.form}
        </Text>
        <Text style={styles.medicineStock}>
          Tồn kho: {item.stockQuantity} {item.unit}
        </Text>
        <Text style={styles.medicineExpiry}>
          Hạn sử dụng: {item.expiryDate}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderUsageItem = ({ item }: { item: MedicineUsage }) => (
    <View style={styles.usageCard}>
      <View style={styles.usageHeader}>
        <Text style={styles.usageStudent}>{item.studentName}</Text>
        <Text style={styles.usageDate}>{item.usageDate}</Text>
      </View>
      <View style={styles.usageInfo}>
        <Text style={styles.usageMedicine}>
          Thuốc: {item.medicineName} ({item.dosage})
        </Text>
        <Text style={styles.usageDetail}>
          Số lượng: {item.quantity} • {item.frequency} • {item.duration}
        </Text>
        <Text style={styles.usageReason}>Lý do: {item.reason}</Text>
        <Text style={styles.usageGivenBy}>Người cấp: {item.givenBy}</Text>
      </View>
    </View>
  );

  const renderFilterChip = (
    label: string,
    value: string,
    currentFilter: string,
    onPress: (value: any) => void
  ) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        currentFilter === value && styles.activeFilterChip,
      ]}
      onPress={() => onPress(value)}
    >
      <Text
        style={[
          styles.filterChipText,
          currentFilter === value && styles.activeFilterChipText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const TabButton = ({
    title,
    isActive,
    onPress,
  }: {
    title: string;
    isActive: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}
    >
      <Text
        style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MedicalColors.primary} />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <CustomHeader
        title="Quản lý Thuốc"
        subtitle="Kho thuốc và vật tư y tế"
        icon={<Text style={{ fontSize: 14 }}>{MedicalIcons.medicine}</Text>}
        showBack={true}
        onBack={() => router.back()}
      />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TabButton
          title="Kho thuốc"
          isActive={activeTab === "inventory"}
          onPress={() => setActiveTab("inventory")}
        />
        <TabButton
          title="Lịch sử sử dụng"
          isActive={activeTab === "usage"}
          onPress={() => setActiveTab("usage")}
        />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={
            activeTab === "inventory"
              ? "Tìm kiếm thuốc..."
              : "Tìm kiếm lịch sử..."
          }
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters - Only show for inventory tab */}
      {activeTab === "inventory" && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Trạng thái:</Text>
              {renderFilterChip("Tất cả", "all", statusFilter, setStatusFilter)}
              {renderFilterChip(
                "Có sẵn",
                "available",
                statusFilter,
                setStatusFilter
              )}
              {renderFilterChip(
                "Sắp hết",
                "low_stock",
                statusFilter,
                setStatusFilter
              )}
              {renderFilterChip(
                "Hết hàng",
                "out_of_stock",
                statusFilter,
                setStatusFilter
              )}
              {renderFilterChip(
                "Hết hạn",
                "expired",
                statusFilter,
                setStatusFilter
              )}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Content */}
      {activeTab === "inventory" ? (
        <FlatList
          data={filteredMedicines}
          renderItem={renderMedicineItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.medicinesList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={usageHistory}
          renderItem={renderUsageItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.usageList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          activeTab === "inventory"
            ? setShowAddModal(true)
            : setShowUsageModal(true)
        }
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Medicine Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết Thuốc</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDetailModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            {selectedMedicine && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Tên thuốc:</Text>
                  <Text style={styles.detailValue}>
                    {selectedMedicine.name}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Tên chung:</Text>
                  <Text style={styles.detailValue}>
                    {selectedMedicine.genericName}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Danh mục:</Text>
                  <Text style={styles.detailValue}>
                    {getCategoryText(selectedMedicine.category)}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Nhà sản xuất:</Text>
                  <Text style={styles.detailValue}>
                    {selectedMedicine.manufacturer}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Liều lượng:</Text>
                  <Text style={styles.detailValue}>
                    {selectedMedicine.dosage}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Dạng thuốc:</Text>
                  <Text style={styles.detailValue}>
                    {selectedMedicine.form}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Tồn kho:</Text>
                  <Text style={styles.detailValue}>
                    {selectedMedicine.stockQuantity} {selectedMedicine.unit}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Mức tồn kho:</Text>
                  <Text style={styles.detailValue}>
                    Tối thiểu: {selectedMedicine.minStockLevel}{" "}
                    {selectedMedicine.unit}
                  </Text>
                  <Text style={styles.detailValue}>
                    Tối đa: {selectedMedicine.maxStockLevel}{" "}
                    {selectedMedicine.unit}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Giá:</Text>
                  <Text style={styles.detailValue}>
                    {selectedMedicine.price.toLocaleString()} VND
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Hạn sử dụng:</Text>
                  <Text style={styles.detailValue}>
                    {selectedMedicine.expiryDate}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Số lô:</Text>
                  <Text style={styles.detailValue}>
                    {selectedMedicine.batchNumber}
                  </Text>
                </View>

                {selectedMedicine.description && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Mô tả:</Text>
                    <Text style={styles.detailValue}>
                      {selectedMedicine.description}
                    </Text>
                  </View>
                )}

                {selectedMedicine.sideEffects && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Tác dụng phụ:</Text>
                    <Text style={styles.detailValue}>
                      {selectedMedicine.sideEffects}
                    </Text>
                  </View>
                )}

                {selectedMedicine.contraindications && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Chống chỉ định:</Text>
                    <Text style={styles.detailValue}>
                      {selectedMedicine.contraindications}
                    </Text>
                  </View>
                )}

                {selectedMedicine.storage && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Bảo quản:</Text>
                    <Text style={styles.detailValue}>
                      {selectedMedicine.storage}
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Add Medicine Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm Thuốc</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tên thuốc *</Text>
                <TextInput
                  style={styles.input}
                  value={newMedicine.name}
                  onChangeText={(text) =>
                    setNewMedicine({ ...newMedicine, name: text })
                  }
                  placeholder="Tên thuốc"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tên chung</Text>
                <TextInput
                  style={styles.input}
                  value={newMedicine.genericName}
                  onChangeText={(text) =>
                    setNewMedicine({ ...newMedicine, genericName: text })
                  }
                  placeholder="Tên chung"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Danh mục</Text>
                <TextInput
                  style={styles.input}
                  value={newMedicine.category}
                  onChangeText={(text) =>
                    setNewMedicine({ ...newMedicine, category: text })
                  }
                  placeholder="analgesic, antibiotic, antiseptic, vitamin, other"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nhà sản xuất</Text>
                <TextInput
                  style={styles.input}
                  value={newMedicine.manufacturer}
                  onChangeText={(text) =>
                    setNewMedicine({ ...newMedicine, manufacturer: text })
                  }
                  placeholder="Nhà sản xuất"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Liều lượng</Text>
                <TextInput
                  style={styles.input}
                  value={newMedicine.dosage}
                  onChangeText={(text) =>
                    setNewMedicine({ ...newMedicine, dosage: text })
                  }
                  placeholder="VD: 500mg, 10%"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dạng thuốc</Text>
                <TextInput
                  style={styles.input}
                  value={newMedicine.form}
                  onChangeText={(text) =>
                    setNewMedicine({ ...newMedicine, form: text })
                  }
                  placeholder="tablet, syrup, injection, solution"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Số lượng tồn kho *</Text>
                <TextInput
                  style={styles.input}
                  value={newMedicine.stockQuantity}
                  onChangeText={(text) =>
                    setNewMedicine({ ...newMedicine, stockQuantity: text })
                  }
                  placeholder="Số lượng"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Đơn vị *</Text>
                <TextInput
                  style={styles.input}
                  value={newMedicine.unit}
                  onChangeText={(text) =>
                    setNewMedicine({ ...newMedicine, unit: text })
                  }
                  placeholder="viên, chai, lọ, hộp"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Hạn sử dụng *</Text>
                <TextInput
                  style={styles.input}
                  value={newMedicine.expiryDate}
                  onChangeText={(text) =>
                    setNewMedicine({ ...newMedicine, expiryDate: text })
                  }
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Số lô</Text>
                <TextInput
                  style={styles.input}
                  value={newMedicine.batchNumber}
                  onChangeText={(text) =>
                    setNewMedicine({ ...newMedicine, batchNumber: text })
                  }
                  placeholder="Số lô sản xuất"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mô tả</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newMedicine.description}
                  onChangeText={(text) =>
                    setNewMedicine({ ...newMedicine, description: text })
                  }
                  placeholder="Mô tả thuốc"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleAddMedicine}
              >
                <Text style={styles.confirmButtonText}>Thêm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Usage Modal */}
      <Modal
        visible={showUsageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUsageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ghi nhận sử dụng thuốc</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowUsageModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mã thuốc *</Text>
                <TextInput
                  style={styles.input}
                  value={newUsage.medicineId}
                  onChangeText={(text) =>
                    setNewUsage({ ...newUsage, medicineId: text })
                  }
                  placeholder="Mã thuốc từ kho"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mã học sinh *</Text>
                <TextInput
                  style={styles.input}
                  value={newUsage.studentId}
                  onChangeText={(text) =>
                    setNewUsage({ ...newUsage, studentId: text })
                  }
                  placeholder="VD: HS001"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tên học sinh *</Text>
                <TextInput
                  style={styles.input}
                  value={newUsage.studentName}
                  onChangeText={(text) =>
                    setNewUsage({ ...newUsage, studentName: text })
                  }
                  placeholder="Họ và tên"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Lớp</Text>
                <TextInput
                  style={styles.input}
                  value={newUsage.grade}
                  onChangeText={(text) =>
                    setNewUsage({ ...newUsage, grade: text })
                  }
                  placeholder="VD: 10A1"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Số lượng *</Text>
                <TextInput
                  style={styles.input}
                  value={newUsage.quantity}
                  onChangeText={(text) =>
                    setNewUsage({ ...newUsage, quantity: text })
                  }
                  placeholder="Số lượng sử dụng"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Liều dùng</Text>
                <TextInput
                  style={styles.input}
                  value={newUsage.dosage}
                  onChangeText={(text) =>
                    setNewUsage({ ...newUsage, dosage: text })
                  }
                  placeholder="VD: 1 viên, 5ml"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tần suất</Text>
                <TextInput
                  style={styles.input}
                  value={newUsage.frequency}
                  onChangeText={(text) =>
                    setNewUsage({ ...newUsage, frequency: text })
                  }
                  placeholder="VD: 3 lần/ngày"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Thời gian</Text>
                <TextInput
                  style={styles.input}
                  value={newUsage.duration}
                  onChangeText={(text) =>
                    setNewUsage({ ...newUsage, duration: text })
                  }
                  placeholder="VD: 5 ngày"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Lý do sử dụng *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newUsage.reason}
                  onChangeText={(text) =>
                    setNewUsage({ ...newUsage, reason: text })
                  }
                  placeholder="Lý do sử dụng thuốc"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ghi chú</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newUsage.notes}
                  onChangeText={(text) =>
                    setNewUsage({ ...newUsage, notes: text })
                  }
                  placeholder="Ghi chú thêm..."
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowUsageModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleAddUsage}
              >
                <Text style={styles.confirmButtonText}>Ghi nhận</Text>
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
    backgroundColor: MedicalColors.background,
  },
  header: {
    backgroundColor: MedicalColors.accent,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerContent: {
    flex: 1,
  },
  headerIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: MedicalColors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 5,
  },
  activeTabButton: {
    backgroundColor: MedicalColors.accent + "20",
  },
  tabButtonText: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    fontWeight: "500",
  },
  activeTabButtonText: {
    color: MedicalColors.accent,
    fontWeight: "bold",
  },
  searchContainer: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: MedicalColors.border,
  },
  searchInput: {
    backgroundColor: MedicalColors.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: MedicalColors.border,
  },
  filtersContainer: {
    backgroundColor: "white",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: MedicalColors.border,
  },
  filterSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginRight: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: MedicalColors.textSecondary,
    marginRight: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: MedicalColors.inputBackground,
    marginRight: 8,
    borderWidth: 1,
    borderColor: MedicalColors.border,
  },
  activeFilterChip: {
    backgroundColor: MedicalColors.accent + "20",
    borderColor: MedicalColors.accent,
  },
  filterChipText: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
  },
  activeFilterChipText: {
    color: MedicalColors.accent,
    fontWeight: "500",
  },
  medicinesList: {
    padding: 20,
  },
  medicineCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  medicineHeaderLeft: {
    flex: 1,
  },
  medicineHeaderRight: {
    gap: 5,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
  },
  medicineGeneric: {
    fontSize: 12,
    color: MedicalColors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  medicineInfo: {
    gap: 5,
  },
  medicineDetail: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
  },
  medicineStock: {
    fontSize: 14,
    fontWeight: "500",
    color: MedicalColors.textPrimary,
  },
  medicineExpiry: {
    fontSize: 12,
    color: MedicalColors.textMuted,
  },
  usageList: {
    padding: 20,
  },
  usageCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: MedicalColors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  usageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  usageStudent: {
    fontSize: 16,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
  },
  usageDate: {
    fontSize: 12,
    color: MedicalColors.textMuted,
  },
  usageInfo: {
    gap: 5,
  },
  usageMedicine: {
    fontSize: 14,
    fontWeight: "500",
    color: MedicalColors.textPrimary,
  },
  usageDetail: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
  },
  usageReason: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
  },
  usageGivenBy: {
    fontSize: 12,
    color: MedicalColors.textMuted,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: MedicalColors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: MedicalColors.textSecondary,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: MedicalColors.accent,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: MedicalColors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    width: width - 40,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: MedicalColors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: MedicalColors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 20,
    color: MedicalColors.textSecondary,
  },
  modalBody: {
    padding: 20,
    maxHeight: "80%",
  },
  detailSection: {
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: MedicalColors.textPrimary,
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 14,
    color: MedicalColors.textSecondary,
    marginBottom: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: MedicalColors.textPrimary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: MedicalColors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: MedicalColors.inputBackground,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: MedicalColors.border,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MedicalColors.border,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: MedicalColors.textSecondary,
    fontWeight: "500",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: MedicalColors.accent,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
});
