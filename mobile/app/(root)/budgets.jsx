import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, TextInput } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../config/supabase";
import { useBudget } from "../../hooks/useBudget";
import { getStyles } from "../../assets/styles/budgets.styles";
import { useTheme } from "../../context/ThemeContext";

import { EXPENSE_CATEGORY_NAMES as CATEGORIES } from "../../constants/categories";

export default function BudgetsScreen() {
  const { COLORS } = useTheme();
  const styles = getStyles(COLORS);
  
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Food & Drinks");
  const [amount, setAmount] = useState("");

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const { budgets, loading, fetchBudgets, createBudget, deleteBudget } = useBudget(user?.id);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBudgets(currentMonth, currentYear);
    }, [fetchBudgets, currentMonth, currentYear])
  );

  const handleSaveBudget = async () => {
    if (!amount || isNaN(amount)) {
      Alert.alert("Error", "Please enter a valid numeric amount");
      return;
    }
    const success = await createBudget(selectedCategory, Number(amount), currentMonth, currentYear);
    if (success) {
      setShowModal(false);
      setAmount("");
    }
  };

  const handleDeleteBudget = async (id) => {
    Alert.alert("Delete Budget", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteBudget(id, currentMonth, currentYear);
        },
      },
    ]);
  };

  const getProgressColor = (percent) => {
    if (percent < 75) return COLORS.income; // Green
    if (percent < 90) return COLORS.primary; // Or yellow if available
    return COLORS.expense; // Red
  };

  const getStatusText = (percent) => {
    if (percent < 75) return "On track";
    if (percent < 90) return "Nearing limit";
    return "Budget exceeded";
  };

  if (loading && budgets.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Budgets</Text>
          <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.fabText}>New</Text>
          </TouchableOpacity>
        </View>

        {budgets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No budgets set for this month</Text>
          </View>
        ) : (
          budgets.map((b) => {
            const safePercent = Math.min(b.percentage, 100);
            const color = getProgressColor(b.percentage);
            
            return (
              <View key={b.id} style={styles.budgetCard}>
                <View style={styles.budgetHeader}>
                  <Text style={styles.categoryLabel}>{b.category}</Text>
                  <View style={styles.budgetAmounts}>
                    <Text style={styles.spentAmount}>₹{b.spent.toLocaleString("en-IN")}</Text>
                    <Text style={styles.limitAmount}>of ₹{b.limit.toLocaleString("en-IN")}</Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <View 
                    style={[styles.progressBar, { width: `${safePercent}%`, backgroundColor: color }]} 
                  />
                </View>

                <View style={styles.budgetFooter}>
                  <Text style={[styles.statusText, { color }]}>
                    {getStatusText(b.percentage)} ({b.percentage}%)
                  </Text>
                  <TouchableOpacity onPress={() => handleDeleteBudget(b.id)}>
                    <Ionicons name="trash-outline" size={20} color={COLORS.expense} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Budget Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: COLORS.card, padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: "700", color: COLORS.text }}>Set Budget</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.textLight, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Category</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 100,
                    backgroundColor: selectedCategory === cat ? COLORS.primary : COLORS.background,
                    borderWidth: 1,
                    borderColor: selectedCategory === cat ? COLORS.primary : COLORS.border,
                  }}
                >
                  <Text style={{ color: selectedCategory === cat ? "#fff" : COLORS.text, fontWeight: "600" }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.textLight, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Monthly Limit (₹)</Text>
            <TextInput
              style={{
                backgroundColor: COLORS.background,
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 16,
                padding: 16,
                fontSize: 18,
                color: COLORS.text,
                fontWeight: "600",
                marginBottom: 24,
              }}
              keyboardType="numeric"
              placeholder="e.g. 5000"
              placeholderTextColor={COLORS.textLight}
              value={amount}
              onChangeText={setAmount}
            />

            <TouchableOpacity
              onPress={handleSaveBudget}
              style={{ backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 100, alignItems: "center" }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Save Budget</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
