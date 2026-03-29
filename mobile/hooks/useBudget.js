import { useState, useCallback } from 'react';
import { fetchWithAuth } from '../lib/api';
import { useToast } from '../context/ToastContext';

export const useBudget = (userId) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchBudgets = useCallback(async (month, year) => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await fetchWithAuth(`/budgets?month=${month}&year=${year}`);
      setBudgets(data);
    } catch (error) {
      console.error("Fetch Budgets Error:", error);
      showToast({ type: 'error', text1: 'Error', text2: 'Failed to fetch budgets' });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createBudget = async (category, amount, month, year) => {
    try {
      await fetchWithAuth(`/budgets`, {
        method: "POST",
        body: JSON.stringify({ category, amount, month, year }),
      });
      showToast({ type: 'success', text1: 'Success', text2: 'Budget created successfully' });
      await fetchBudgets(month, year);
      return true;
    } catch (error) {
      console.error("Create Budget Error:", error);
      showToast({ type: 'error', text1: 'Failed', text2: error.message });
      return false;
    }
  };

  const deleteBudget = async (id, month, year) => {
    try {
      await fetchWithAuth(`/budgets/${id}`, { method: "DELETE" });
      showToast({ type: 'success', text1: 'Deleted', text2: 'Budget deleted successfully' });
      await fetchBudgets(month, year);
      return true;
    } catch (error) {
      console.error("Delete Budget Error:", error);
      showToast({ type: 'error', text1: 'Deletion Failed', text2: error.message });
      return false;
    }
  };

  return { budgets, loading, fetchBudgets, createBudget, deleteBudget };
};
