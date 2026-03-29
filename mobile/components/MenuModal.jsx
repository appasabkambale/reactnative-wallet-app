import React from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { useTheme } from "../context/ThemeContext";

export default function MenuModal({ visible, onClose, onExport, onLogout }) {
  const { COLORS, isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();
  
  const version = Constants.expoConfig?.version || "1.0.0";

  const handleNav = (route) => {
    onClose();
    router.push(route);
  };

  const handleExport = () => {
    onClose();
    onExport();
  };

  const menuItems = [
    { icon: "speedometer-outline", label: "Budgets", onPress: () => handleNav("/budgets"), color: COLORS.primary },
    { icon: "calendar-outline", label: "Recurring", onPress: () => handleNav("/recurring"), color: COLORS.primary },
    { icon: "download-outline", label: "Export to CSV or PDF", onPress: handleExport, color: COLORS.primary },
    { icon: isDarkMode ? "sunny-outline" : "moon-outline", label: isDarkMode ? "Light Mode" : "Dark Mode", onPress: toggleTheme, color: COLORS.text },
    { icon: "log-out-outline", label: "Logout", onPress: onLogout, color: COLORS.expense },
  ];

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={{ backgroundColor: COLORS.card, width: "80%", borderRadius: 24, paddingVertical: 12, overflow: "hidden" }}>
          <View style={{ paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: COLORS.text }}>More Options</Text>
          </View>

          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: index < menuItems.length - 1 ? 1 : 0, borderBottomColor: COLORS.border }}
            >
              <Ionicons name={item.icon} size={24} color={item.color} style={{ marginRight: 16 }} />
              <Text style={{ fontSize: 16, fontWeight: "600", color: item.color }}>{item.label}</Text>
            </TouchableOpacity>
          ))}

          <View style={{ alignItems: "center", paddingVertical: 16, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.background }}>
            <Text style={{ fontSize: 12, fontWeight: "500", color: COLORS.textLight, marginBottom: 4 }}>App Version {version}</Text>
            <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.textLight, letterSpacing: 0.5 }}>Developed by Tech9x</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
