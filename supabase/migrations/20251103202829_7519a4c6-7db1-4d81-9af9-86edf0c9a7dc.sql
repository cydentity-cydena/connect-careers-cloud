-- Create enum for ATS types
CREATE TYPE ats_provider AS ENUM ('workday', 'greenhouse', 'lever', 'bamboohr', 'webhook');

-- Webhook integrations table
CREATE TABLE public.webhook_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  trigger_on_verification BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ATS connections table
CREATE TABLE public.ats_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider ats_provider NOT NULL,
  name TEXT NOT NULL,
  credentials JSONB NOT NULL, -- stores API keys, tokens, etc.
  field_mappings JSONB, -- custom field mappings
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Integration logs table
CREATE TABLE public.integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL,
  integration_id UUID,
  payload JSONB,
  response JSONB,
  status TEXT NOT NULL, -- 'success', 'failed', 'pending'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webhook_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for webhook_integrations
CREATE POLICY "Users can view their own webhooks"
  ON public.webhook_integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own webhooks"
  ON public.webhook_integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own webhooks"
  ON public.webhook_integrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own webhooks"
  ON public.webhook_integrations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for ats_connections
CREATE POLICY "Users can view their own ATS connections"
  ON public.ats_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ATS connections"
  ON public.ats_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ATS connections"
  ON public.ats_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ATS connections"
  ON public.ats_connections FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for integration_logs
CREATE POLICY "Users can view their own integration logs"
  ON public.integration_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create integration logs"
  ON public.integration_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_webhook_integrations_user_id ON public.webhook_integrations(user_id);
CREATE INDEX idx_ats_connections_user_id ON public.ats_connections(user_id);
CREATE INDEX idx_integration_logs_user_id ON public.integration_logs(user_id);
CREATE INDEX idx_integration_logs_candidate_id ON public.integration_logs(candidate_id);
CREATE INDEX idx_integration_logs_created_at ON public.integration_logs(created_at DESC);