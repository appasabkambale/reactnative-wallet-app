import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { FlatList, Text, View, Image, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { useTransactions } from "../../hooks/useTransactions";
import { useEffect, useState } from 'react';
import PageLoader from "../../components/PageLoader";
import { styles } from "../../assets/styles/home.styles";
import { Ionicons } from "@expo/vector-icons";
import SignOutButton from "../../components/SignOutButton";
import BalanceCard from "../../components/BalanceCard";
import TransactionItem from "../../components/TransactionItem";
import NoTransactionFound from "../../components/NoTransactionFound"
import { COLORS } from "../../constants/colors";

export default function Page() {
  const { user } = useUser();
  const router = useRouter();
  const { transactions, summary, isLoading, loadData, deleteTransaction } = useTransactions(user.id);
  const [refreshing, setRefreshing] = useState(false) 
  
  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  useEffect(() => {
    loadData();
  }, [loadData]);

  

  const handleDelete = (id) => {
    Alert.alert("Delete Transaction", "Are you sure you want to delete this transaction?",[
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTransaction(id) },
    ]);
  };
  
  if(isLoading && !refreshing) return <PageLoader />



  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* HEADER */}
        <View style={styles.header}>
            {/* LEFT */}
            <View style={styles.headerLeft}>
              <Image 
              source={require("../../assets/images/logo.png")} 
              style={styles.headerLogo}
              resizeMode="contain" 
              />
                <View style={styles.welcomeContainer}>
                  <Text style={styles.welcomeText}>Welcome</Text>
                  <Text style={styles.usernameText}>{user?.emailAddresses[0]?.emailAddress.split("@")[0]}</Text>
                </View>
            </View>
            {/* RIGHT */}
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.addButton} onPress={() => router.push("/create")}>
              <Ionicons name="add-circle" size={20} color="#FFF" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
            <SignOutButton />
          </View>
        </View>  

        <BalanceCard summary={summary} />

        <View style={styles.transactionsHeaderContainer}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
        </View>  
      </View>   

      {/* FlatList is a performant way to render long lists in React Native */}
      {/* it renders item lazyly - only those on the screen */}

      <FlatList
  data={transactions}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => (
    <TransactionItem item={item} onDelete={handleDelete} />
  )}
  style={styles.transactionsList}
  contentContainerStyle={styles.transactionsListContent}
  ListEmptyComponent={<NoTransactionFound />}

  // 🔽 pull-to-refresh
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[COLORS.primary]}        // Android spinner color
      tintColor={COLORS.primary}       // iOS spinner color
    />
  }
  showsVerticalScrollIndicator={false}
/>

    </View>
  );
}

