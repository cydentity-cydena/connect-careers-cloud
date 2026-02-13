
-- Add Stripe Connect account ID to candidate_profiles
ALTER TABLE public.candidate_profiles
ADD COLUMN IF NOT EXISTS stripe_connect_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_connect_onboarding_complete BOOLEAN DEFAULT false;

-- Create marketplace payouts tracking table
CREATE TABLE public.marketplace_payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  engagement_id UUID REFERENCES public.marketplace_engagements(id) ON DELETE SET NULL,
  talent_id UUID NOT NULL,
  client_id UUID NOT NULL,
  gross_amount_gbp NUMERIC(10,2) NOT NULL,
  platform_fee_gbp NUMERIC(10,2) NOT NULL,
  net_amount_gbp NUMERIC(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_payouts ENABLE ROW LEVEL SECURITY;

-- Talent can see their own payouts
CREATE POLICY "Talent can view own payouts"
ON public.marketplace_payouts
FOR SELECT
USING (talent_id = auth.uid());

-- Clients can see their own payouts
CREATE POLICY "Clients can view own payouts"
ON public.marketplace_payouts
FOR SELECT
USING (client_id = auth.uid());

-- Only service role can insert/update payouts (via edge functions)
CREATE POLICY "Service role manages payouts"
ON public.marketplace_payouts
FOR ALL
USING (auth.role() = 'service_role');
