export const TRANSACTION_CATEGORIES = [
  { id: "food",            name: "Food & Drinks",  icon: "restaurant",      color: "#F59E0B" },
  { id: "shopping",        name: "Shopping",       icon: "bag-handle",      color: "#EC4899" },
  { id: "transportation",  name: "Transportation", icon: "car",             color: "#3B82F6" },
  { id: "entertainment",   name: "Entertainment",  icon: "game-controller", color: "#8B5CF6" },
  { id: "bills",           name: "Bills",          icon: "document-text",   color: "#10B981" },
  { id: "income",          name: "Income",         icon: "arrow-down",      color: "#10B981" },
  { id: "other",           name: "Other",          icon: "grid",            color: "#6B7280" },
];

export const CATEGORY_NAMES = TRANSACTION_CATEGORIES.map(c => c.name);
export const EXPENSE_CATEGORY_NAMES = CATEGORY_NAMES.filter(n => n !== "Income");

export const FILTER_CATEGORIES = [
  { id: "all", name: "All", icon: "apps", color: "#6366F1" },
  ...TRANSACTION_CATEGORIES
];
