import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getStyles } from "../assets/styles/home.styles";
import { useTheme } from "../context/ThemeContext";

const BalanceCard = ({ summary }) => {
  const { COLORS } = useTheme();
  const styles = getStyles(COLORS);
  
  return (
    <LinearGradient
      colors={COLORS.primaryGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.balanceCard}
    >
      <Text style={styles.balanceLabel}>Total Balance</Text>
      <Text style={styles.balanceAmount}>
        ₹{parseFloat(summary.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <View style={styles.statIconWrapper}>
            <Ionicons name="arrow-down-outline" size={20} color={COLORS.black} />
          </View>
          <View>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={styles.statValue}>
              ₹{parseFloat(summary.income || 0).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        <View style={styles.statBox}>
          <View style={styles.statIconWrapper}>
            <Ionicons name="arrow-up-outline" size={20} color={COLORS.black} />
          </View>
          <View>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={styles.statValue}>
              ₹{Math.abs(parseFloat(summary.expenses || 0)).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

export default React.memo(BalanceCard);