import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from "@expo/vector-icons";
import { getStyles } from "../assets/styles/home.styles";
import { formatDate } from "../lib/utils";
import { useTheme } from "../context/ThemeContext";

const ICONS = {
  "food & drinks": { icon: "restaurant", color: "#F59E0B" },
  shopping: { icon: "bag-handle", color: "#EC4899" },
  transportation: { icon: "car", color: "#3B82F6" },
  entertainment: { icon: "game-controller", color: "#8B5CF6" },
  bills: { icon: "document-text", color: "#10B981" },
  income: { icon: "arrow-down", color: "#10B981" },
  expense: { icon: "arrow-up", color: "#EF4444" },
  other: { icon: "grid", color: "#6B7280" },
};

const TransactionItem = ({ item, onDelete}) => {
  const { COLORS } = useTheme();
  const styles = getStyles(COLORS);
  
  const amount   = parseFloat(item?.amount ?? 0);
  const isIncome = amount > 0;
  const categoryKey = (item?.category ?? "other").toLowerCase();
  
  const iconData = ICONS[categoryKey] || (isIncome ? ICONS.income : ICONS.expense);
  const amountColor = isIncome ? COLORS.income : COLORS.text;

  return (
    <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.transactionItem} key={item.id}>
        <View style={[styles.iconContainer, { backgroundColor: `${iconData.color}20` }]}>
            <Ionicons name={iconData.icon} size={24} color={iconData.color} />
        </View>
        
        <View style={styles.txLeft}>
            <Text style={styles.txTitle}>{item.title}</Text>
            <Text style={styles.txDate}>{item.created_at ? formatDate(item.created_at) : "Just now"}</Text>
        </View>

        <View style={styles.txRight}>
            <Text style={[styles.txAmount, { color: amountColor }]}>
               {isIncome ? "+" : "-"}₹{Math.abs(amount).toLocaleString('en-IN')}
            </Text>
            <TouchableOpacity onPress={() => onDelete(item.id)} style={{marginTop: 8, paddingHorizontal: 4}}>
                <Text style={{color: COLORS.expense, fontSize: 13, fontWeight: "700"}}>Delete</Text>
            </TouchableOpacity>
        </View>
    </Animated.View>
  );
};

export default React.memo(TransactionItem);