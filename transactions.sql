CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  order_id UUID REFERENCES orders(id),
  amount NUMERIC(10,2),
  payment_method TEXT,
  phone_number TEXT,
  reference TEXT UNIQUE,
  transaction_id TEXT,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_transactions_reference ON transactions(reference);
CREATE INDEX idx_transactions_restaurant ON transactions(restaurant_id);
