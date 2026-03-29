import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import DateTimePicker from '@react-native-community/datetimepicker';

import { FILTER_CATEGORIES as CATEGORIES } from "../constants/categories";

export default function FilterModal({ visible, onClose, onApply, currentFilters }) {
  const { COLORS } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState(currentFilters?.category || "");
  const [dateFrom, setDateFrom] = useState(currentFilters?.dateFrom || "");
  const [dateTo, setDateTo] = useState(currentFilters?.dateTo || "");
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const handleFromChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowFromPicker(false);
    if (event.type === 'dismissed') setShowFromPicker(false);
    if (selectedDate) {
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const d = String(selectedDate.getDate()).padStart(2, '0');
      setDateFrom(`${y}-${m}-${d}`);
      if (Platform.OS === 'ios') setShowFromPicker(false);
    }
  };

  const handleToChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowToPicker(false);
    if (event.type === 'dismissed') setShowToPicker(false);
    if (selectedDate) {
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const d = String(selectedDate.getDate()).padStart(2, '0');
      setDateTo(`${y}-${m}-${d}`);
      if (Platform.OS === 'ios') setShowToPicker(false);
    }
  };

  const handleQuickDate = (option) => {
    const today = new Date();
    let from = new Date();
    let to = new Date();

    switch (option) {
      case "Today":
        break;
      case "This Week":
        from.setDate(today.getDate() - today.getDay());
        break;
      case "This Month":
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case "Last Month":
        from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        to = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case "This Year":
        from = new Date(today.getFullYear(), 0, 1);
        break;
    }

    const formatDate = (date) => {
      // Avoid timezone shift issues by extracting local parts
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };
    
    setDateFrom(formatDate(from));
    setDateTo(formatDate(to));
  };

  const handleApply = () => {
    onApply({
      category: selectedCategory === "All" ? "" : selectedCategory,
      dateFrom,
      dateTo,
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedCategory("");
    setDateFrom("");
    setDateTo("");
    onApply({ category: "", dateFrom: "", dateTo: "" });
    onClose();
  };

  const hasActiveFilters = selectedCategory || dateFrom || dateTo;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
      }}>
        <View style={{
          backgroundColor: COLORS.card,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: Platform.OS === "ios" ? 40 : 24,
          maxHeight: "75%",
        }}>
          {/* Handle bar */}
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: COLORS.border }} />
          </View>

          {/* Header */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: COLORS.text }}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Category Filter */}
            <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.textLight, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 14 }}>
              Category
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 28 }}>
              {CATEGORIES.map((cat) => {
                const active = selectedCategory === cat.name || (cat.name === "All" && !selectedCategory);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.name === "All" ? "" : cat.name)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 100,
                      backgroundColor: active ? cat.color : COLORS.cardAlt || COLORS.background,
                      borderWidth: 1,
                      borderColor: active ? cat.color : COLORS.border,
                    }}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={16}
                      color={active ? "#FFFFFF" : cat.color}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: active ? "#FFFFFF" : COLORS.text,
                    }}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Date Range */}
            <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.textLight, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 14 }}>
              Date Range
            </Text>

            {/* Quick Date Selection */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {["Today", "This Week", "This Month", "Last Month", "This Year"].map((qd) => (
                <TouchableOpacity
                  key={qd}
                  onPress={() => handleQuickDate(qd)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: COLORS.cardAlt || COLORS.background,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.text }}>
                    {qd}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 32 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: COLORS.textLight, fontWeight: "500", marginBottom: 6 }}>From</Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: COLORS.background,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                  }}
                  onPress={() => setShowFromPicker(true)}
                >
                  <Text style={{ fontSize: 15, color: dateFrom ? COLORS.text : COLORS.textLight, fontWeight: "500" }}>
                    {dateFrom || "YYYY-MM-DD"}
                  </Text>
                </TouchableOpacity>
                {showFromPicker && (
                  <DateTimePicker
                    value={dateFrom ? new Date(dateFrom) : new Date()}
                    mode="date"
                    display="default"
                    onChange={handleFromChange}
                  />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: COLORS.textLight, fontWeight: "500", marginBottom: 6 }}>To</Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: COLORS.background,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                  }}
                  onPress={() => setShowToPicker(true)}
                >
                  <Text style={{ fontSize: 15, color: dateTo ? COLORS.text : COLORS.textLight, fontWeight: "500" }}>
                    {dateTo || "YYYY-MM-DD"}
                  </Text>
                </TouchableOpacity>
                {showToPicker && (
                  <DateTimePicker
                    value={dateTo ? new Date(dateTo) : new Date()}
                    mode="date"
                    display="default"
                    onChange={handleToChange}
                  />
                )}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            {hasActiveFilters && (
              <TouchableOpacity
                onPress={handleClear}
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  borderRadius: 100,
                  alignItems: "center",
                  borderWidth: 1.5,
                  borderColor: COLORS.border,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.textLight }}>Clear All</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleApply}
              style={{
                flex: 1,
                paddingVertical: 16,
                borderRadius: 100,
                alignItems: "center",
                backgroundColor: COLORS.primary,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#FFFFFF" }}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
