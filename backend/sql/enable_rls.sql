-- ============================================================
-- Enable Row Level Security (RLS) on the `transactions` table
-- ============================================================
-- Run this in your Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Enable RLS on the table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Users can SELECT only their own transactions
CREATE POLICY "Users can view own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- 3. Policy: Users can INSERT only with their own user_id
CREATE POLICY "Users can insert own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- 4. Policy: Users can DELETE only their own transactions
CREATE POLICY "Users can delete own transactions"
  ON public.transactions
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- 5. Policy: Users can UPDATE only their own transactions
CREATE POLICY "Users can update own transactions"
  ON public.transactions
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);
