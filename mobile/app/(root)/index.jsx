import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../config/supabase";

import BalanceCard from "../../components/BalanceCard";
import TransactionItem from "../../components/TransactionItem";
import FilterModal from "../../components/FilterModal";
import MenuModal from "../../components/MenuModal";
import ExportModal from "../../components/ExportModal";
import { useTransactions } from "../../hooks/useTransactions";
import { getStyles } from "../../assets/styles/home.styles";
import { useTheme } from "../../context/ThemeContext";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  const { COLORS, isDarkMode, toggleTheme } = useTheme();
  const styles = getStyles(COLORS);

  // Search, Filter & Menu state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [filters, setFilters] = useState({ category: "", dateFrom: "", dateTo: "" });

  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const activeFilters = useMemo(() => {
    const obj = {};
    if (debouncedSearch.trim()) obj.q = debouncedSearch.trim();
    if (filters.category) obj.category = filters.category;
    if (filters.dateFrom) obj.dateFrom = filters.dateFrom;
    if (filters.dateTo) obj.dateTo = filters.dateTo;
    return obj;
  }, [debouncedSearch, filters.category, filters.dateFrom, filters.dateTo]);

  const { transactions, summary, loading, refreshing, loadingMore, loadMore, handleRefresh, deleteTransaction } = useTransactions(user?.id, activeFilters);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  // React Query auto-fetches when userId becomes available (via `enabled: !!userId`)
  // No need for useFocusEffect — React Query handles cache freshness automatically

  const handleDelete = useCallback((id) => deleteTransaction(id), [deleteTransaction]);

  const handleLogout = async () => {
    setShowMenu(false);
    await supabase.auth.signOut();
    router.replace("/sign-in");
  };

  // Server-side filtering applied via activeFilters in useTransactions

  const activeFilterCount = [filters.category, filters.dateFrom, filters.dateTo].filter(Boolean).length;

  const renderItem = useCallback(({ item }) => (
    <TransactionItem item={item} onDelete={handleDelete} />
  ), [handleDelete]);

  const ListHeader = useMemo(() => (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>Good morning,</Text>
          <Text style={styles.usernameText}>
            {user?.user_metadata?.first_name || (user?.email ? user.email.split('@')[0] : "User")}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <TouchableOpacity onPress={() => setShowSearch((s) => !s)}>
             <Ionicons name="search" size={24} color={COLORS.textLight} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowMenu(true)}>
             <Ionicons name="ellipsis-vertical" size={24} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
      </View>

      <BalanceCard summary={summary} />

      {/* Search bar */}
      {showSearch && (
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: COLORS.card,
          borderRadius: 16,
          paddingHorizontal: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: COLORS.border,
        }}>
          <Ionicons name="search" size={20} color={COLORS.textLight} />
          <TextInput
            style={{
              flex: 1,
              paddingVertical: 14,
              paddingHorizontal: 10,
              fontSize: 16,
              color: COLORS.text,
              fontWeight: "500",
            }}
            placeholder="Search transactions..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {searchQuery || activeFilterCount > 0 ? "Results" : "Recent activity"}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity 
            onPress={() => setShowFilter(true)}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Ionicons name="options-outline" size={20} color={COLORS.primary} />
            {activeFilterCount > 0 && (
              <View style={{
                backgroundColor: COLORS.primary,
                borderRadius: 10,
                width: 20,
                height: 20,
                justifyContent: "center",
                alignItems: "center",
                marginLeft: 4,
              }}>
                <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ), [user, summary, isDarkMode, COLORS, styles, showSearch, searchQuery, activeFilterCount]);

  const EmptyListComponent = useCallback(() => (
    <View style={{ alignItems: "center", marginTop: 40 }}>
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.primary} />
      ) : (
        <View style={{ alignItems: "center" }}>
          <Ionicons 
            name={searchQuery || activeFilterCount > 0 ? "search" : "wallet-outline"} 
            size={48} 
            color={COLORS.textLight} 
          />
          <Text style={{ color: COLORS.textLight, marginTop: 12, fontSize: 15, fontWeight: "500" }}>
            {searchQuery || activeFilterCount > 0 ? "No matching transactions" : "No transactions yet"}
          </Text>
        </View>
      )}
    </View>
  ), [loading, COLORS, searchQuery, activeFilterCount]);

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyListComponent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} /> : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
        }
      />
      
      <FilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={setFilters}
        currentFilters={filters}
      />

      <MenuModal
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        onExport={() => setShowExport(true)}
        onLogout={handleLogout}
      />

      <ExportModal
        visible={showExport}
        onClose={() => setShowExport(false)}
      />
    </View>
  );
}
