import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, TextInput, Switch } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../config/supabase";
import { useRecurring } from "../../hooks/useRecurring";
import { getStyles } from "../../assets/styles/recurring.styles";
import { useTheme } from "../../context/ThemeContext";

import { CATEGORY_NAMES as CATEGORIES } from "../../constants/categories";

const FREQUENCIES = ["daily", "weekly", "monthly", "yearly"];

export default function RecurringScreen() {
  const { COLORS } = useTheme();
  const styles = getStyles(COLORS);
  
  const [user, setUser] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Bills");
  const [selectedFreq, setSelectedFreq] = useState("monthly");
  const [isExpense, setIsExpense] = useState(true);

  const { items, loading, fetchItems, addRecurring, toggleRecurring, deleteRecurring } = useRecurring(user?.id);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [fetchItems])
  );

  const handleSave = async () => {
    if (!title || !amount || isNaN(amount)) {
      Alert.alert("Error", "Please enter a valid title and numeric amount");
      return;
    }
    const finalAmount = isExpense ? -Math.abs(Number(amount)) : Math.abs(Number(amount));
    
    const success = await addRecurring({
      title,
      category: selectedCategory,
      amount: finalAmount,
      frequency: selectedFreq,
    });

    if (success) {
      setShowModal(false);
      setTitle("");
      setAmount("");
    }
  };

  const handleToggle = async (id) => {
    await toggleRecurring(id);
  };

  const handleDelete = async (id) => {
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteRecurring(id);
        },
      },
    ]);
  };

  if (loading && items.length === 0) {
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
          <Text style={styles.headerTitle}>Recurring</Text>
          <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.fabText}>New</Text>
          </TouchableOpacity>
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No recurring transactions set up</Text>
          </View>
        ) : (
          items.map((item) => {
            const isExp = Number(item.amount) < 0;
            const amtColor = isExp ? COLORS.text : COLORS.income;
            const nextRunStr = new Date(item.next_run).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            return (
              <View key={item.id} style={[styles.card, { opacity: item.is_active ? 1 : 0.5 }]}>
                <View style={styles.cardLeft}>
                  <View style={styles.titleRow}>
                    <Text style={styles.titleText}>{item.title}</Text>
                    <Text style={[styles.amountText, { color: amtColor }]}>
                      {isExp ? "-" : "+"}₹{Math.abs(Number(item.amount)).toLocaleString("en-IN")}
                    </Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                    <View style={styles.freqBadge}>
                      <Text style={styles.freqText}>{item.frequency}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={styles.nextRunText}>Next: {nextRunStr}</Text>
                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                      <Text style={{ color: COLORS.expense, fontSize: 13, fontWeight: "600" }}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Switch
                  value={item.is_active}
                  onValueChange={() => handleToggle(item.id)}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor="#fff"
                />
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: COLORS.card, padding: 24, paddingBottom: 40, borderTopLeftRadius: 24, borderTopRightRadius: 24, height: "85%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: "700", color: COLORS.text }}>Add Recurring Item</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              
              {/* Type Toggle */}
              <View style={{ flexDirection: "row", backgroundColor: COLORS.background, borderRadius: 16, padding: 4, marginBottom: 20 }}>
                <TouchableOpacity
                  onPress={() => setIsExpense(true)}
                  style={{ flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 12, backgroundColor: isExpense ? COLORS.card : "transparent" }}
                >
                  <Text style={{ fontWeight: isExpense ? "700" : "500", color: isExpense ? COLORS.text : COLORS.textLight }}>Expense</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsExpense(false)}
                  style={{ flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 12, backgroundColor: !isExpense ? COLORS.card : "transparent" }}
                >
                  <Text style={{ fontWeight: !isExpense ? "700" : "500", color: !isExpense ? COLORS.income : COLORS.textLight }}>Income</Text>
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.textLight, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Title</Text>
              <TextInput
                style={{ backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 16, fontSize: 16, color: COLORS.text, marginBottom: 20 }}
                placeholder="e.g. Netflix Subscription"
                placeholderTextColor={COLORS.textLight}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.textLight, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Amount (₹)</Text>
              <TextInput
                style={{ backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 16, fontSize: 16, color: COLORS.text, marginBottom: 20 }}
                keyboardType="numeric"
                placeholder="e.g. 500"
                placeholderTextColor={COLORS.textLight}
                value={amount}
                onChangeText={setAmount}
              />

              <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.textLight, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Frequency</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
                {FREQUENCIES.map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    onPress={() => setSelectedFreq(freq)}
                    style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, backgroundColor: selectedFreq === freq ? COLORS.primary : COLORS.background, borderWidth: 1, borderColor: selectedFreq === freq ? COLORS.primary : COLORS.border }}
                  >
                    <Text style={{ color: selectedFreq === freq ? "#fff" : COLORS.text, fontWeight: "600", textTransform: "capitalize" }}>{freq}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.textLight, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Category</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 30 }}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, backgroundColor: selectedCategory === cat ? COLORS.primary : COLORS.background, borderWidth: 1, borderColor: selectedCategory === cat ? COLORS.primary : COLORS.border }}
                  >
                    <Text style={{ color: selectedCategory === cat ? "#fff" : COLORS.text, fontWeight: "600" }}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity onPress={handleSave} style={{ backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 100, alignItems: "center" }}>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Save Recurring Item</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
