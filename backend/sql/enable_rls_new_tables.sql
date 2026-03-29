-- Enable RLS
ALTER TABLE "public"."recurring_transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."budgets" ENABLE ROW LEVEL SECURITY;

-- Policies for recurring_transactions
CREATE POLICY "Users can only view their own recurring transactions" ON "public"."recurring_transactions"
FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can only insert their own recurring transactions" ON "public"."recurring_transactions"
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can only update their own recurring transactions" ON "public"."recurring_transactions"
FOR UPDATE USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can only delete their own recurring transactions" ON "public"."recurring_transactions"
FOR DELETE USING (auth.uid()::text = user_id);

-- Policies for budgets
CREATE POLICY "Users can only view their own budgets" ON "public"."budgets"
FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can only insert their own budgets" ON "public"."budgets"
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can only update their own budgets" ON "public"."budgets"
FOR UPDATE USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can only delete their own budgets" ON "public"."budgets"
FOR DELETE USING (auth.uid()::text = user_id);
