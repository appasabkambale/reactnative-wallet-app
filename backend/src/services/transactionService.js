import { prisma } from "../config/db.js";

export const getTransactionsByUserIdService = async (userId) => {
    const transactions = await prisma.transaction.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
    return transactions;
};

export const createTransactionService = async (userId, data) => {
    const { title, amount, category } = data;
    const parsedAmt = parseFloat(amount);
    if (isNaN(parsedAmt) || parsedAmt === 0 || Math.abs(parsedAmt) > 99999999) {
      const error = new Error("Invalid amount. Must be non-zero and within ±99,999,999.");
      error.code = "VALIDATION";
      throw error;
    }
    const transaction = await prisma.transaction.create({
      data: {
        user_id: userId,
        title,
        amount: parsedAmt,
        category
      }
    });

    return transaction;
};

export const deleteTransactionService = async (userId, parsedId) => {
    const existingTrans = await prisma.transaction.findUnique({ where: { id: parsedId } });
    if (!existingTrans || existingTrans.user_id !== userId) {
        const error = new Error("Transaction not found");
        error.code = "NOT_FOUND";
        throw error;
    }

    await prisma.transaction.delete({ where: { id: parsedId } });
};

export const getSummaryByUserIdService = async (userId) => {
    const balanceResult = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { user_id: userId }
    });

    const incomeResult = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { user_id: userId, amount: { gt: 0 } }
    });

    const expensesResult = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { user_id: userId, amount: { lt: 0 } }
    });
    
    const summaryPayload = {
      balance: Number(balanceResult._sum.amount || 0),
      income: Number(incomeResult._sum.amount || 0),
      expenses: Number(expensesResult._sum.amount || 0),
    };
    
    return summaryPayload;
};

export const getAnalyticsService = async (userId, month, year) => {
    const m = parseInt(month) || (new Date().getMonth() + 1);
    const y = parseInt(year) || new Date().getFullYear();

    // --- Category breakdown for selected month ---
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 1);

    const categoryData = await prisma.transaction.groupBy({
      by: ['category'],
      _sum: { amount: true },
      _count: true,
      where: {
        user_id: userId,
        amount: { lt: 0 }, // expenses only
        created_at: { gte: startDate, lt: endDate },
      },
    });

    const categoryBreakdown = categoryData.map((c) => ({
      category: c.category,
      amount: Math.abs(Number(c._sum.amount || 0)),
      count: c._count,
    }));

    // --- Monthly trend (last 6 months) ---
    const trendMonths = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(y, m - 1 - i, 1);
      trendMonths.push({ month: d.getMonth() + 1, year: d.getFullYear() });
    }

    const trend = [];
    for (const tm of trendMonths) {
      const tmStart = new Date(tm.year, tm.month - 1, 1);
      const tmEnd = new Date(tm.year, tm.month, 1);

      const [incomeAgg, expenseAgg] = await Promise.all([
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { user_id: userId, amount: { gt: 0 }, created_at: { gte: tmStart, lt: tmEnd } },
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { user_id: userId, amount: { lt: 0 }, created_at: { gte: tmStart, lt: tmEnd } },
        }),
      ]);

      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      trend.push({
        label: monthNames[tm.month - 1],
        month: tm.month,
        year: tm.year,
        income: Number(incomeAgg._sum.amount || 0),
        expense: Math.abs(Number(expenseAgg._sum.amount || 0)),
      });
    }

    return { categoryBreakdown, trend, month: m, year: y };
};

export const searchTransactionsService = async (userId, filters) => {
    const { q, category, dateFrom, dateTo, page = 1, limit = 20 } = filters;
    const where = { user_id: userId };
    
    if (q) {
      where.title = { contains: q, mode: 'insensitive' };
    }
    if (category) {
      where.category = category;
    }
    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) where.created_at.gte = new Date(dateFrom);
      if (dateTo) where.created_at.lte = new Date(dateTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    };
};

export const exportTransactionsService = async (userId, filters) => {
    const { dateFrom, dateTo } = filters;
    const where = { user_id: userId };
    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) where.created_at.gte = new Date(dateFrom);
      if (dateTo) where.created_at.lte = new Date(dateTo);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    return transactions;
};
