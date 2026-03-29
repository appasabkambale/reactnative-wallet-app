import { useCallback, useState } from "react";
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../context/ToastContext";
import { fetchWithAuth } from "../lib/api";
import { checkBudgetThresholds } from "../lib/notifications";

export const useTransactions = (userId, filters = {}, limit = 20) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  // Refresher state for standard RefreshControl
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Transactions List (Infinite Query)
  const transactionsQuery = useInfiniteQuery({
    queryKey: ['transactions', 'list', userId, filters],
    queryFn: async ({ pageParam = 1 }) => {
      const queryParams = new URLSearchParams({
        page: pageParam.toString(),
        limit: limit.toString(),
        ...filters
      }).toString();
      return fetchWithAuth(`/transactions/search?${queryParams}`);
    },
    getNextPageParam: (lastPage) => {
      return lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // 2. Summary (Standard Query)
  const isBaseQuery = Object.keys(filters).length === 0;
  const summaryQuery = useQuery({
    queryKey: ['transactions', 'summary', userId],
    queryFn: () => fetchWithAuth(`/transactions/summary`),
    enabled: !!userId && isBaseQuery,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // 3. Mutations
  const deleteMutation = useMutation({
    mutationFn: (id) => fetchWithAuth(`/transactions/${id}`, { method: "DELETE" }),
    onMutate: async (deletedId) => {
      // Optimistic Delete: instantly remove from UI
      await queryClient.cancelQueries({ queryKey: ['transactions', 'list', userId] });

      // Snapshot all matching list queries for rollback
      const previousLists = queryClient.getQueriesData({ queryKey: ['transactions', 'list', userId] });

      // Remove the transaction from every cached list variant (different filter combos)
      queryClient.setQueriesData({ queryKey: ['transactions', 'list', userId] }, (old) => {
        if (!old || !old.pages) return old;
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            transactions: page.transactions.filter(t => t.id !== deletedId),
          })),
        };
      });

      return { previousLists };
    },
    onError: (error, deletedId, context) => {
      console.error("Error deleting:", error);
      showToast({ type: 'error', text1: 'Deletion Failed', text2: error.message });
      // Rollback all list caches to their previous state
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      showToast({ type: 'success', text1: 'Deleted', text2: 'Transaction removed successfully' });
      queryClient.invalidateQueries({ queryKey: ['transactions', 'list', userId] });
      queryClient.invalidateQueries({ queryKey: ['transactions', 'summary', userId] });
    }
  });

  const addMutation = useMutation({
    mutationFn: (data) => fetchWithAuth(`/transactions`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onMutate: async (newTx) => {
      // Optimistic Update
      await queryClient.cancelQueries({ queryKey: ['transactions', 'list', userId] });
      
      const previousTransactions = queryClient.getQueryData(['transactions', 'list', userId, {}]);
      
      // We optimistically update the base list (no filters) for simplicity
      if (previousTransactions) {
        queryClient.setQueryData(['transactions', 'list', userId, {}], (old) => {
          if (!old || !old.pages || old.pages.length === 0) return old;
          
          const optimisticTx = {
            id: Math.random().toString(), // temporary ID
            created_at: new Date().toISOString(),
            ...newTx,
          };

          return {
            ...old,
            pages: [
              {
                ...old.pages[0],
                transactions: [optimisticTx, ...old.pages[0].transactions],
              },
              ...old.pages.slice(1),
            ],
          };
        });
      }
      return { previousTransactions };
    },
    onError: (error, newTx, context) => {
      console.error("Error adding:", error);
      showToast({ type: 'error', text1: 'Failed', text2: error.message });
      if (context?.previousTransactions) {
        queryClient.setQueryData(['transactions', 'list', userId, {}], context.previousTransactions);
      }
    },
    onSettled: (data, error, variables) => {
      showToast({ type: 'success', text1: 'Success', text2: 'Transaction created successfully!' });
      queryClient.invalidateQueries({ queryKey: ['transactions', 'list', userId] });
      queryClient.invalidateQueries({ queryKey: ['transactions', 'summary', userId] });

      // If this was an expense, check budget thresholds and fire alerts
      if (variables?.amount < 0) {
        checkBudgetThresholds(fetchWithAuth);
      }
    }
  });

  // Safe flattening
  const transactions = transactionsQuery.data?.pages.flatMap(page => page.transactions) ?? [];
  
  // Fallback summary if it's not a base query; uses the cached base summary if available
  let summary = summaryQuery.data || { balance: 0, income: 0, expenses: 0 };
  if (!isBaseQuery) {
    const cachedSummary = queryClient.getQueryData(['transactions', 'summary', userId]);
    if (cachedSummary) summary = cachedSummary;
  }

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      transactionsQuery.refetch(),
      isBaseQuery ? summaryQuery.refetch() : Promise.resolve()
    ]);
    setIsRefreshing(false);
  }, [transactionsQuery, summaryQuery, isBaseQuery]);

  // Backward compatibility wrapper
  const loadData = async () => {
    await handleRefresh();
  };

  return {
    transactions,
    summary,
    loading: transactionsQuery.isLoading || summaryQuery.isLoading,
    refreshing: isRefreshing,
    loadingMore: transactionsQuery.isFetchingNextPage,
    hasMore: !!transactionsQuery.hasNextPage,
    loadMore: transactionsQuery.fetchNextPage,
    handleRefresh,
    loadData,
    deleteTransaction: async (id) => deleteMutation.mutateAsync(id),
    addTransaction: async (data) => {
      try {
        await addMutation.mutateAsync(data);
        return true;
      } catch (err) {
        return false;
      }
    }
  };
};
