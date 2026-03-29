import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Platform, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { supabase } from "../config/supabase";
import { API_URL } from "../constants/api";
import { useTheme } from "../context/ThemeContext";

export default function ExportModal({ visible, onClose }) {
  const { COLORS } = useTheme();

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

  const formatDate = (date) => date.toISOString().split("T")[0];
  const formatDisplay = (date) =>
    date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const [dateFrom, setDateFrom] = useState(firstDay);
  const [dateTo, setDateTo] = useState(now);
  const [format, setFormat] = useState("csv");
  const [loading, setLoading] = useState(false);

  // Picker visibility state
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const onFromChange = (event, selectedDate) => {
    setShowFromPicker(Platform.OS === "ios"); // iOS keeps picker open
    if (selectedDate) {
      setDateFrom(selectedDate);
      // Ensure "from" doesn't exceed "to"
      if (selectedDate > dateTo) setDateTo(selectedDate);
    }
  };

  const onToChange = (event, selectedDate) => {
    setShowToPicker(Platform.OS === "ios");
    if (selectedDate) {
      setDateTo(selectedDate);
      // Ensure "to" doesn't precede "from"
      if (selectedDate < dateFrom) setDateFrom(selectedDate);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const fileExt = format === "pdf" ? "pdf" : "csv";
      const mimeType = format === "pdf" ? "application/pdf" : "text/csv";
      const uti =
        format === "pdf"
          ? "com.adobe.pdf"
          : "public.comma-separated-values-text";
      const fileUri = `${FileSystem.documentDirectory}transactions_export_${Date.now()}.${fileExt}`;
      const exportUrl = `${API_URL}/transactions/export?dateFrom=${formatDate(dateFrom)}&dateTo=${formatDate(dateTo)}&format=${format}`;

      const { uri, status } = await FileSystem.downloadAsync(exportUrl, fileUri, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (status !== 200) {
        throw new Error("Failed to export");
      }

      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType,
          dialogTitle: `Export Transactions (${format.toUpperCase()})`,
          UTI: uti,
        });
      } else {
        Alert.alert("Success", "File saved, but sharing is not available on this device.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not export transactions");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <View
          style={{
            backgroundColor: COLORS.card,
            padding: 24,
            paddingBottom: 40,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "700", color: COLORS.text }}>
              Export Transactions
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>

          {/* Format Toggle */}
          <Text style={labelStyle(COLORS)}>Format</Text>
          <View
            style={{
              flexDirection: "row",
              backgroundColor: COLORS.background,
              borderRadius: 16,
              padding: 4,
              marginBottom: 24,
            }}
          >
            <TouchableOpacity
              onPress={() => setFormat("csv")}
              style={toggleStyle(format === "csv", COLORS)}
            >
              <Text style={toggleTextStyle(format === "csv", COLORS)}>CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFormat("pdf")}
              style={toggleStyle(format === "pdf", COLORS)}
            >
              <Text style={toggleTextStyle(format === "pdf", COLORS)}>PDF</Text>
            </TouchableOpacity>
          </View>

          {/* Date Range */}
          <Text style={labelStyle(COLORS)}>Date Range</Text>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
            {/* From Date */}
            <TouchableOpacity
              onPress={() => setShowFromPicker(true)}
              style={dateButtonStyle(COLORS)}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar-outline" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
              <View>
                <Text style={{ fontSize: 11, color: COLORS.textLight, fontWeight: "600", marginBottom: 2 }}>From</Text>
                <Text style={{ fontSize: 15, color: COLORS.text, fontWeight: "600" }}>
                  {formatDisplay(dateFrom)}
                </Text>
              </View>
            </TouchableOpacity>

            {/* To Date */}
            <TouchableOpacity
              onPress={() => setShowToPicker(true)}
              style={dateButtonStyle(COLORS)}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar-outline" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
              <View>
                <Text style={{ fontSize: 11, color: COLORS.textLight, fontWeight: "600", marginBottom: 2 }}>To</Text>
                <Text style={{ fontSize: 15, color: COLORS.text, fontWeight: "600" }}>
                  {formatDisplay(dateTo)}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Quick presets */}
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 28 }}>
            {[
              { label: "This Month", from: new Date(now.getFullYear(), now.getMonth(), 1), to: now },
              { label: "Last Month", from: new Date(now.getFullYear(), now.getMonth() - 1, 1), to: new Date(now.getFullYear(), now.getMonth(), 0) },
              { label: "This Year", from: new Date(now.getFullYear(), 0, 1), to: now },
              { label: "All Time", from: new Date(2020, 0, 1), to: now },
            ].map((preset) => (
              <TouchableOpacity
                key={preset.label}
                onPress={() => { setDateFrom(preset.from); setDateTo(preset.to); }}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 20,
                  backgroundColor: COLORS.background,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "600", color: COLORS.textLight }}>{preset.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Export Button */}
          <TouchableOpacity
            onPress={handleExport}
            disabled={loading}
            style={{
              backgroundColor: COLORS.primary,
              paddingVertical: 16,
              borderRadius: 100,
              alignItems: "center",
              opacity: loading ? 0.7 : 1,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
              {loading ? "Generating..." : `Download & Share ${format.toUpperCase()}`}
            </Text>
          </TouchableOpacity>

          {/* Native Date Pickers */}
          {showFromPicker && (
            <DateTimePicker
              value={dateFrom}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              maximumDate={now}
              onChange={onFromChange}
            />
          )}
          {showToPicker && (
            <DateTimePicker
              value={dateTo}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              maximumDate={now}
              minimumDate={dateFrom}
              onChange={onToChange}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

// --- Helper styles ---
const labelStyle = (COLORS) => ({
  fontSize: 13,
  fontWeight: "600",
  color: COLORS.textLight,
  marginBottom: 8,
  textTransform: "uppercase",
  letterSpacing: 1,
});

const toggleStyle = (isActive, COLORS) => ({
  flex: 1,
  paddingVertical: 12,
  alignItems: "center",
  borderRadius: 12,
  backgroundColor: isActive ? COLORS.card : "transparent",
});

const toggleTextStyle = (isActive, COLORS) => ({
  fontWeight: isActive ? "700" : "500",
  color: isActive ? COLORS.text : COLORS.textLight,
});

const dateButtonStyle = (COLORS) => ({
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: COLORS.background,
  borderWidth: 1,
  borderColor: COLORS.border,
  borderRadius: 16,
  padding: 14,
});
