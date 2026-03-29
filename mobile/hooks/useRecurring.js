import { useState, useCallback } from 'react';
import { fetchWithAuth } from '../lib/api';
import { useToast } from '../context/ToastContext';

export const useRecurring = (userId) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchItems = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await fetchWithAuth(`/recurring`);
      setItems(data);
    } catch (error) {
      console.error("Fetch Recurring Error:", error);
      showToast({ type: 'error', text1: 'Error', text2: 'Failed to fetch recurring transactions' });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addRecurring = async (data) => {
    try {
      await fetchWithAuth(`/recurring`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      showToast({ type: 'success', text1: 'Success', text2: 'Recurring transaction added' });
      await fetchItems();
      return true;
    } catch (error) {
      console.error("Add Recurring Error:", error);
      showToast({ type: 'error', text1: 'Failed', text2: error.message });
      return false;
    }
  };

  const toggleRecurring = async (id) => {
    try {
      await fetchWithAuth(`/recurring/${id}/toggle`, { method: "PUT" });
      await fetchItems();
      return true;
    } catch (error) {
      console.error("Toggle Recurring Error:", error);
      showToast({ type: 'error', text1: 'Update Failed', text2: error.message });
      return false;
    }
  };

  const deleteRecurring = async (id) => {
    try {
      await fetchWithAuth(`/recurring/${id}`, { method: "DELETE" });
      showToast({ type: 'success', text1: 'Deleted', text2: 'Recurring transaction stopped' });
      await fetchItems();
      return true;
    } catch (error) {
      console.error("Delete Recurring Error:", error);
      showToast({ type: 'error', text1: 'Deletion Failed', text2: error.message });
      return false;
    }
  };

  return { items, loading, fetchItems, addRecurring, toggleRecurring, deleteRecurring };
};
