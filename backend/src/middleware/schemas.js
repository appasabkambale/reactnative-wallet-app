import { z } from "zod";

export const createTransactionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.coerce.number().refine(val => val !== 0, "Amount cannot be zero"),
  category: z.string().min(1, "Category is required")
});

export const setBudgetSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.coerce.number().min(0, "Amount must be positive"),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).optional()
});

export const createRecurringSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.coerce.number().refine(val => val !== 0, "Amount cannot be zero"),
  category: z.string().min(1, "Category is required"),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"], {
    errorMap: () => ({ message: "Invalid frequency. Must be daily, weekly, monthly, or yearly" })
  })
});
