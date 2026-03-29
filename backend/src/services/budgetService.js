import { prisma } from "../config/db.js";

export const getBudgetsService = async (userId, month, year) => {
  const m = parseInt(month) || (new Date().getMonth() + 1);
  const y = parseInt(year) || new Date().getFullYear();

  // Get all budgets for the month
  const budgets = await prisma.budget.findMany({
    where: { user_id: userId, month: m, year: y },
  });

  // Calculate actual spending per category for the same month
  const startDate = new Date(y, m - 1, 1);
  const endDate = new Date(y, m, 1);

  const spending = await prisma.transaction.groupBy({
    by: ["category"],
    _sum: { amount: true },
    where: {
      user_id: userId,
      amount: { lt: 0 },
      created_at: { gte: startDate, lt: endDate },
    },
  });

  const spendingMap = {};
  spending.forEach((s) => {
    spendingMap[s.category] = Math.abs(Number(s._sum.amount || 0));
  });

  // Merge budgets with actual spend
  return budgets.map((b) => ({
    id: b.id,
    category: b.category,
    limit: Number(b.amount),
    spent: spendingMap[b.category] || 0,
    percentage: spendingMap[b.category]
      ? Math.round((spendingMap[b.category] / Number(b.amount)) * 100)
      : 0,
    month: b.month,
    year: b.year,
  }));
};

export const setBudgetService = async (userId, data) => {
  const { category, amount, month, year } = data;
  const m = parseInt(month) || (new Date().getMonth() + 1);
  const y = parseInt(year) || new Date().getFullYear();
  const parsedAmt = parseFloat(amount);
  if (isNaN(parsedAmt) || parsedAmt <= 0 || parsedAmt > 99999999) {
    const error = new Error("Invalid amount. Must be positive and within 99,999,999.");
    error.code = "VALIDATION";
    throw error;
  }

  return await prisma.budget.upsert({
    where: {
      user_id_category_month_year: {
        user_id: userId,
        category,
        month: m,
        year: y,
      },
    },
    update: { amount: parsedAmt },
    create: {
      user_id: userId,
      category,
      amount: parsedAmt,
      month: m,
      year: y,
    },
  });
};

export const deleteBudgetService = async (userId, parsedId) => {
  const existing = await prisma.budget.findUnique({ where: { id: parsedId } });
  if (!existing || existing.user_id !== userId) {
    const error = new Error("Budget not found");
    error.code = "NOT_FOUND";
    throw error;
  }

  await prisma.budget.delete({ where: { id: parsedId } });
};
