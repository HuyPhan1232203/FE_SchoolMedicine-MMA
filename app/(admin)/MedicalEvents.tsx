import { StyleSheet, Text, View } from "react-native";
import CustomHeader from "../../components/CustomHeader";
import { MedicalColors, MedicalIcons } from "../../constants/Colors";

export default function MedicalEvents() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <CustomHeader
        title="Sự kiện Y tế"
        subtitle="Quản lý sự kiện y tế"
        icon={<Text style={{ fontSize: 14 }}>{MedicalIcons.alert}</Text>}
      />
      <Text style={styles.title}>Quản lý Sự kiện Y tế</Text>
      <Text style={styles.subtitle}>Tính năng đang phát triển...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: MedicalColors.backgroundSecondary,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: MedicalColors.textPrimary,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: MedicalColors.textSecondary,
    textAlign: "center",
  },
});
