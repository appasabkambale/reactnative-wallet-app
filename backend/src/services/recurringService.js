import { prisma } from "../config/db.js";

export const getRecurringTransactionsService = async (userId) => {
  return await prisma.recurringTransaction.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  });
};

export const createRecurringTransactionService = async (userId, data) => {
  const { title, amount, category, frequency } = data;

  // Calculate next_run based on frequency
  const now = new Date();
  let nextRun = new Date(now);
  switch (frequency) {
    case "daily":   nextRun.setDate(nextRun.getDate() + 1); break;
    case "weekly":  nextRun.setDate(nextRun.getDate() + 7); break;
    case "monthly": nextRun.setMonth(nextRun.getMonth() + 1); break;
    case "yearly":  nextRun.setFullYear(nextRun.getFullYear() + 1); break;
  }

  return await prisma.recurringTransaction.create({
    data: {
      user_id: userId,
      title,
      amount: parseFloat(amount),
      category,
      frequency,
      next_run: nextRun,
    },
  });
};

export const toggleRecurringTransactionService = async (userId, parsedId) => {
  const existing = await prisma.recurringTransaction.findUnique({ where: { id: parsedId } });
  if (!existing || existing.user_id !== userId) {
    const error = new Error("Recurring transaction not found");
    error.code = "NOT_FOUND";
    throw error;
  }

  return await prisma.recurringTransaction.update({
    where: { id: parsedId },
    data: { is_active: !existing.is_active },
  });
};

export const deleteRecurringTransactionService = async (userId, parsedId) => {
  const existing = await prisma.recurringTransaction.findUnique({ where: { id: parsedId } });
  if (!existing || existing.user_id !== userId) {
    const error = new Error("Recurring transaction not found");
    error.code = "NOT_FOUND";
    throw error;
  }

  await prisma.recurringTransaction.delete({ where: { id: parsedId } });
};

export const processRecurringTransactionsService = async () => {
  const now = new Date();
  const dueItems = await prisma.recurringTransaction.findMany({
    where: {
      is_active: true,
      next_run: { lte: now },
    },
  });

  console.log(`Processing ${dueItems.length} recurring transactions...`);

  for (const item of dueItems) {
    // Create the actual transaction
    await prisma.transaction.create({
      data: {
        user_id: item.user_id,
        title: item.title,
        amount: item.amount,
        category: item.category,
      },
    });

    // Advance next_run
    let nextRun = new Date(item.next_run);
    switch (item.frequency) {
      case "daily":   nextRun.setDate(nextRun.getDate() + 1); break;
      case "weekly":  nextRun.setDate(nextRun.getDate() + 7); break;
      case "monthly": nextRun.setMonth(nextRun.getMonth() + 1); break;
      case "yearly":  nextRun.setFullYear(nextRun.getFullYear() + 1); break;
    }

    await prisma.recurringTransaction.update({
      where: { id: item.id },
      data: { next_run: nextRun },
    });
  }

  console.log(`Processed ${dueItems.length} recurring transactions successfully`);
};
