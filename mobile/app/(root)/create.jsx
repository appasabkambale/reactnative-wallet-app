// mobile/app/create.jsx  (or wherever this lives)
import React, { useState } from "react";
import { View, Text, Alert, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";

import { API_URL } from "@/constants/api";
import { styles } from "@/assets/styles/create.styles";
import { COLORS } from "@/constants/colors";

const CATEGORIES = [
  { id: "food",            name: "Food & Drinks",  icon: "fast-food-outline" },
  { id: "shopping",        name: "Shopping",       icon: "cart-outline" },
  { id: "transportation",  name: "Transportation", icon: "car-outline" },
  { id: "entertainment",   name: "Entertainment",  icon: "film-outline" },
  { id: "bills",           name: "Bills",          icon: "receipt-outline" },
  { id: "income",          name: "Income",         icon: "cash-outline" },
  { id: "other",           name: "Other",          icon: "ellipsis-horizontal-circle-outline" },
];

export default function CreateScreen() {
  const router = useRouter();
  const { user } = useUser();

  const [title, setTitle]               = useState("");
  const [amount, setAmount]             = useState("");
  const [selectedCategory, setSelected] = useState("");
  const [isExpense, setIsExpense]       = useState(true);
  const [isLoading, setIsLoading]       = useState(false);

  /* --------------------------- handlers --------------------------- */
  const handleCreate = async () => {
    // 1. validation
    if (!title.trim()) return Alert.alert("Error", "Please enter a transaction title");

    const parsedAmt = parseFloat(amount);
    if (!amount || isNaN(parsedAmt) || parsedAmt <= 0) {
      return Alert.alert("Error", "Please enter a valid amount");
    }

    if (!selectedCategory) return Alert.alert("Error", "Please select a category");

    // 2. construct payload
    const formattedAmount = isExpense ? -Math.abs(parsedAmt) : Math.abs(parsedAmt);

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          title,
          amount: formattedAmount,
          category: selectedCategory,   // ← sends e.g. "Food & Drinks"
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create transaction");
      }

      Alert.alert("Success", "Transaction created successfully");
      router.back();
    } catch (err) {
      console.error("Error creating transaction:", err);
      Alert.alert("Error", err.message || "Failed to create transaction");
    } finally {
      setIsLoading(false);
    }
  };

  /* ----------------------------- UI ------------------------------ */
  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>New Transaction</Text>

        <TouchableOpacity
          style={[styles.saveButtonContainer, isLoading && styles.saveButtonDisabled]}
          onPress={handleCreate}
          disabled={isLoading}
        >
          <Text style={styles.saveButton}>{isLoading ? "Saving..." : "Save"}</Text>
          {!isLoading && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
        </TouchableOpacity>
      </View>

      {/* Amount */}
      <View style={styles.card}>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              isExpense && styles.typeButtonActive,
            ]}
            onPress={() => setIsExpense(true)}
          >
            <Ionicons
              style={styles.typeIcon}
              name="arrow-down-circle"
              size={22}
              color={isExpense ? COLORS.white : COLORS.expense}
            />
            <Text
              style={[
                styles.typeButtonText,
                isExpense && styles.typeButtonTextActive,
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              !isExpense && styles.typeButtonActive,
            ]}
            onPress={() => setIsExpense(false)}
          >
            <Ionicons
              style={styles.typeIcon}
              name="arrow-up-circle"
              size={22}
              color={!isExpense ? COLORS.white : COLORS.income}
            />
            <Text
              style={[
                styles.typeButtonText,
                !isExpense && styles.typeButtonTextActive,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount input */}
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            style={styles.amountInput}
            keyboardType="numeric"
            placeholderTextColor={COLORS.textLight}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* Title input */}
        <View style={styles.inputContainer}>
            <Ionicons 
                name="create-outline" 
                size={22}
                color={COLORS.textLight} 
                style={styles.inputIcon} 
            />
            <TextInput
                style={styles.input}
                placeholder="Title (e.g., Groceries)"
                placeholderTextColor={COLORS.textLight}
                value={title}
                onChangeText={setTitle}
            />
        </View>

        {/* Categories */}
        <Text style={styles.sectionTitle}>
            <Ionicons name="pricetag-outline" size={16} color={COLORS.text} /> Category
        </Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.name;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  active && styles.categoryButtonActive,
                ]}
                onPress={() => setSelected(cat.name)}
              >
                <Ionicons
                  name={cat.icon}
                  size={20}
                  color={selectedCategory === cat.name ? COLORS.white : COLORS.text}
                  style={styles.categoryIcon}
                />
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === cat.name && styles.categoryButtonTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
    </ScrollView>
  );
}
