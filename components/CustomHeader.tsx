import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MedicalColors } from "../constants/Colors";

interface CustomHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  backgroundColor?: string;
}

export default function CustomHeader({
  title,
  subtitle,
  icon,
  showBack = false,
  onBack,
  actions,
  backgroundColor,
}: CustomHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top + 4,
          backgroundColor: backgroundColor || MedicalColors.primary,
        },
      ]}
    >
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
        <View style={styles.centerContent}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.actions}>{actions}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingTop: 4,
    paddingBottom: 8,
    paddingHorizontal: 8,
    minHeight: undefined,
    shadowColor: undefined,
    shadowOffset: undefined,
    shadowOpacity: undefined,
    shadowRadius: undefined,
    elevation: undefined,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  backButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  backButtonPlaceholder: {
    width: 20,
    height: 20,
    marginRight: 4,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  icon: {
    marginRight: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: "bold",
    color: "white",
    marginBottom: 0,
  },
  subtitle: {
    display: "none",
  },
  actions: {
    minWidth: 20,
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 4,
  },
});
