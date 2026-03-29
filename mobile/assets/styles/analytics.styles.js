import { StyleSheet, Platform, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const getStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 50 : 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  // Month selector
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  monthArrow: {
    padding: 8,
  },
  monthText: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    marginHorizontal: 20,
    minWidth: 130,
    textAlign: "center",
  },
  // Section cards
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  // Chart container  
  chartContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  chartWidth: {
    width: SCREEN_WIDTH - 88, // 20 padding + 24 card padding on each side
  },
  // Legend
  legendContainer: {
    marginTop: 16,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 12,
  },
  legendLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  legendAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  legendPercent: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textLight,
    marginLeft: 8,
    minWidth: 42,
    textAlign: "right",
  },
  // Empty state
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
    fontWeight: "500",
    marginTop: 12,
  },
  // Summary row at top of trend
  trendSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  trendStat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  trendStatLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  trendStatValue: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
});
