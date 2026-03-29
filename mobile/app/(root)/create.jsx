import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useRouter, useFocusEffect } from "expo-router";
import { useToast } from "../../context/ToastContext";
import { supabase } from "../../config/supabase";
import { Ionicons } from "@expo/vector-icons";

import { useTransactions } from "../../hooks/useTransactions";
import { getStyles } from "@/assets/styles/create.styles";
import { useTheme } from "@/context/ThemeContext";

import { TRANSACTION_CATEGORIES as CATEGORIES } from "../../constants/categories";

export default function CreateScreen() {
  const router = useRouter();
  const { COLORS } = useTheme();
  const styles = getStyles(COLORS);
  const { showToast } = useToast();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);
  
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelected] = useState("");
  const [isExpense, setIsExpense] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setTitle("");
      setAmount("");
      setSelected("");
      setIsExpense(true);
    }, [])
  );

  const { addTransaction } = useTransactions(user?.id);

  const handleCreate = async () => {
    if (!user) { showToast({ type: 'error', text1: 'Authentication', text2: 'You must be logged in.' }); return; }
    if (!title.trim()) { showToast({ type: 'error', text1: 'Missing Info', text2: 'Please enter a title' }); return; }
    
    const parsedAmt = parseFloat(amount);
    if (!amount || isNaN(parsedAmt) || parsedAmt <= 0) { showToast({ type: 'error', text1: 'Invalid Amount', text2: 'Please enter a valid number' }); return; }
    if (!selectedCategory) { showToast({ type: 'error', text1: 'Missing Info', text2: 'Please select a category' }); return; }

    const formattedAmount = isExpense ? -Math.abs(parsedAmt) : Math.abs(parsedAmt);
    setIsLoading(true);
    
    try {
      const success = await addTransaction({
        title,
        amount: formattedAmount,
        category: selectedCategory,
      });

      if (success) {
        router.back();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Transaction</Text>
        <View style={{width: 48}} />
      </View>

      <KeyboardAwareScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.amountSection}>
          <View style={styles.segmentedControl}>
            <TouchableOpacity style={[styles.segmentBtn, isExpense && styles.segmentBtnActive]} onPress={() => setIsExpense(true)}>
              <Text style={[styles.segmentText, isExpense && styles.segmentTextActive]}>Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.segmentBtn, !isExpense && styles.segmentBtnActive]} onPress={() => setIsExpense(false)}>
              <Text style={[styles.segmentText, !isExpense && styles.segmentTextActive]}>Income</Text>
            </TouchableOpacity>
          </View>

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
        </View>

        <View style={styles.formSection}>
          <TextInput
              style={styles.input}
              placeholder="What was this for?"
              placeholderTextColor={COLORS.textLight}
              value={title}
              onChangeText={setTitle}
          />

          <Text style={styles.sectionTitle}>Select Category</Text>
          <View style={styles.categoryWrapper}>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.name;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip, 
                    active && { backgroundColor: cat.color, borderColor: cat.color }
                  ]}
                  onPress={() => setSelected(cat.name)}
                >
                  <View style={[styles.chipIconBg, active ? { backgroundColor: "rgba(255,255,255,0.25)" } : { backgroundColor: `${cat.color}15` }]}>
                    <Ionicons name={cat.icon} size={16} color={active ? "#FFFFFF" : cat.color} />
                  </View>
                  <Text style={[styles.chipText, active ? { color: "#FFFFFF", fontWeight: "700" } : { color: COLORS.text }]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.disabledButton]}
            onPress={handleCreate}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>{isLoading ? "Processing..." : "Continue"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
