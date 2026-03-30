import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PieChart, BarChart } from "react-native-gifted-charts";
import { supabase } from "../../config/supabase";
import { fetchWithAuth } from "../../lib/api";
import { getStyles } from "../../assets/styles/analytics.styles";
import { useTheme } from "../../context/ThemeContext";

const SCREEN_WIDTH = Dimensions.get("window").width;

const CATEGORY_COLORS = {
  "Food & Drinks": "#F59E0B",
  "Shopping": "#EC4899",
  "Transportation": "#3B82F6",
  "Entertainment": "#8B5CF6",
  "Bills": "#10B981",
  "Income": "#06D6A0",
  "Other": "#6B7280",
};

const FALLBACK_COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#C9CBCF"];

export default function AnalyticsScreen() {
  const { COLORS } = useTheme();
  const styles = getStyles(COLORS);
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({ categoryBreakdown: [], trend: [] });
  
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const loadAnalytics = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchWithAuth(`/transactions/analytics?month=${selectedMonth}&year=${selectedYear}`);
      if (data) {
        setAnalytics(data);
      }
    } catch (err) {
      console.log("Error fetching analytics:", err.message || err);
    } finally {
      setLoading(false);
    }
  }, [user, selectedMonth, selectedYear]);

  useFocusEffect(
    useCallback(() => {
      loadAnalytics();
    }, [loadAnalytics])
  );

  const goToPrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    const now = new Date();
    const isCurrentMonth = selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear();
    if (isCurrentMonth) return;
    
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  // Prepare pie chart data for gifted-charts
  const totalExpense = analytics.categoryBreakdown.reduce((sum, c) => sum + c.amount, 0);
  const pieData = analytics.categoryBreakdown.map((c, i) => ({
    value: c.amount,
    color: CATEGORY_COLORS[c.category] || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    text: totalExpense > 0 ? `${((c.amount / totalExpense) * 100).toFixed(0)}%` : "0%",
    // Store extra info for legend
    _category: c.category,
    _percentage: totalExpense > 0 ? ((c.amount / totalExpense) * 100).toFixed(1) : "0",
  }));

  // Prepare bar chart data for gifted-charts (grouped bars)
  const barData = analytics.trend.flatMap((t) => [
    {
      value: t.income,
      label: t.label,
      frontColor: COLORS.income,
      spacing: 2,
    },
    {
      value: t.expense,
      frontColor: COLORS.expense,
      spacing: 18,
    },
  ]);

  // Trend summary
  const currentMonthTrend = analytics.trend.find(
    (t) => t.month === selectedMonth && t.year === selectedYear
  );

  // Calculate max value for bar chart Y-axis
  const maxBarValue = analytics.trend.reduce((max, t) => Math.max(max, t.income, t.expense), 0);
  const yAxisMax = Math.ceil(maxBarValue / 1000) * 1000 || 1000;

  const formatYLabel = (val) => {
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return `${val}`;
  };

  const pieRadius = (SCREEN_WIDTH - 88) / 2 - 20;

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
        </View>

        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={goToPrevMonth} style={styles.monthArrow}>
            <Ionicons name="chevron-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
          </Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.monthArrow}>
            <Ionicons name="chevron-forward" size={22} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

        {/* Category Breakdown - Pie Chart */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
          
          {pieData.length > 0 ? (
            <>
              <View style={styles.chartContainer}>
                <PieChart
                  data={pieData}
                  donut
                  radius={pieRadius}
                  innerRadius={pieRadius * 0.55}
                  innerCircleColor={COLORS.card}
                  centerLabelComponent={() => (
                    <View style={{ alignItems: "center" }}>
                      <Text style={{ fontSize: 14, color: COLORS.textLight, fontWeight: "600" }}>Total</Text>
                      <Text style={{ fontSize: 20, color: COLORS.text, fontWeight: "800" }}>
                        ₹{totalExpense.toLocaleString("en-IN")}
                      </Text>
                    </View>
                  )}
                  textColor={COLORS.text}
                  textSize={11}
                  showText
                  textBackgroundRadius={16}
                  focusOnPress
                />
              </View>
              <View style={styles.legendContainer}>
                {pieData.map((item, index) => (
                  <View key={index} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={styles.legendLabel}>{item._category}</Text>
                    <Text style={styles.legendAmount}>
                      ₹{item.value.toLocaleString("en-IN")}
                    </Text>
                    <Text style={styles.legendPercent}>{item._percentage}%</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="pie-chart-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No expenses this month</Text>
            </View>
          )}
        </View>

        {/* Income vs Expense Trend - Bar Chart */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Income vs Expense Trend</Text>

          {/* Summary for current month */}
          {currentMonthTrend && (
            <View style={styles.trendSummary}>
              <View style={[styles.trendStat, { backgroundColor: `${COLORS.income}15` }]}>
                <Text style={[styles.trendStatLabel, { color: COLORS.income }]}>Income</Text>
                <Text style={[styles.trendStatValue, { color: COLORS.income }]}>
                  ₹{currentMonthTrend.income.toLocaleString("en-IN")}
                </Text>
              </View>
              <View style={[styles.trendStat, { backgroundColor: `${COLORS.expense}15` }]}>
                <Text style={[styles.trendStatLabel, { color: COLORS.expense }]}>Expense</Text>
                <Text style={[styles.trendStatValue, { color: COLORS.expense }]}>
                  ₹{currentMonthTrend.expense.toLocaleString("en-IN")}
                </Text>
              </View>
            </View>
          )}

          {analytics.trend.length > 0 && analytics.trend.some((t) => t.income > 0 || t.expense > 0) ? (
            <View style={styles.chartContainer}>
              <BarChart
                data={barData}
                barWidth={14}
                spacing={2}
                noOfSections={4}
                maxValue={yAxisMax}
                width={SCREEN_WIDTH - 140}
                height={200}
                yAxisTextStyle={{ color: COLORS.textLight, fontSize: 12, fontWeight: "600" }}
                xAxisLabelTextStyle={{ color: COLORS.textLight, fontSize: 12, fontWeight: "600" }}
                xAxisColor={COLORS.border}
                yAxisColor={COLORS.border}
                rulesColor={COLORS.border}
                formatYLabel={formatYLabel}
                hideOrigin
                isAnimated
                animationDuration={600}
              />
              {/* Legend */}
              <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 12, gap: 24 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: COLORS.income, marginRight: 6 }} />
                  <Text style={{ color: COLORS.textLight, fontSize: 13, fontWeight: "600" }}>Income</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: COLORS.expense, marginRight: 6 }} />
                  <Text style={{ color: COLORS.textLight, fontSize: 13, fontWeight: "600" }}>Expense</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="bar-chart-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No data for this period</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
