import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../assets/styles/home.styles";
import { COLORS } from "../constants/colors";
import { formatDate } from "../lib/utils";

// Map categories to their respective icons
const CATEGORY_ICONS = {
  // detailed categories
  "food & drinks":   "fast-food-outline",
  shopping:          "cart-outline",
  transportation:    "car-outline",
  entertainment:     "film-outline",
  bills:             "cash-outline",

  // generic, data-base-only categories
  income:            "arrow-up-circle-outline",
  expense:           "arrow-down-circle-outline",

  // everything else
  other:             "ellipsis-horizontal-circle-outline",
};

    const TransactionItem = ({ item, onDelete}) => {
    const amount   = parseFloat(item?.amount ?? 0);
    const isIncome = amount > 0;
    const categoryKey = (item?.category ?? "other").toLowerCase();
    const iconName =
  CATEGORY_ICONS[categoryKey]                                          // exact match
  || (isIncome ? "arrow-up-circle-outline" : "arrow-down-circle-outline") // fallback by sign
  || "pricetag-outline";                                               // final fallback
  
    return (
    <View style={styles.transactionCard} key={item.id}>
        <TouchableOpacity style={styles.transactionContent}>
            <View style={styles.categoryIconContainer}>
                <Ionicons name={iconName} size={22} color={isIncome ? COLORS.income : COLORS.expense } />
            </View>
            <View style={styles.transactionLeft}>
                <Text style={styles.transactionTitle}>{item.title}</Text>
                <Text style={styles.transactionCategory}>{item.category}</Text>
            </View>
            <View style={styles.transactionRight}>
                <Text style={[styles.transactionAmount, { color: isIncome ? COLORS.income : COLORS.expense }]}>
                   {isIncome ? "+" : "-"}₹{Math.abs(parseFloat(item.amount)).toFixed(2)}
                </Text>
                <Text style={styles.transactionDate}>{formatDate(item.created_at)}</Text>
            </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(item.id)}>
            <Ionicons name="trash-outline" size={20} color={COLORS.expense} />
        </TouchableOpacity> 
    </View>
  );
};

export default TransactionItem;