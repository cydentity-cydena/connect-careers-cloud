-- Add 'recruiter' to the app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'recruiter';

-- Create clients table for recruiters to manage multiple companies
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  industry TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create placements table for tracking recruiter placements
CREATE TABLE IF NOT EXISTS public.placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  position_title TEXT NOT NULL,
  placement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_date DATE,
  salary_offered INTEGER,
  commission_rate DECIMAL(5,2),
  commission_amount DECIMAL(10,2),
  commission_status TEXT NOT NULL DEFAULT 'pending' CHECK (commission_status IN ('pending', 'approved', 'paid')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;

-- RLS policies for clients table
CREATE POLICY "Recruiters can view own clients"
  ON public.clients FOR SELECT
  USING (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can insert own clients"
  ON public.clients FOR INSERT
  WITH CHECK (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can update own clients"
  ON public.clients FOR UPDATE
  USING (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can delete own clients"
  ON public.clients FOR DELETE
  USING (auth.uid() = recruiter_id);

-- RLS policies for placements table
CREATE POLICY "Recruiters can view own placements"
  ON public.placements FOR SELECT
  USING (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can insert own placements"
  ON public.placements FOR INSERT
  WITH CHECK (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can update own placements"
  ON public.placements FOR UPDATE
  USING (auth.uid() = recruiter_id);

CREATE POLICY "Admins can view all placements"
  ON public.placements FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at on clients
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Create trigger for updated_at on placements
CREATE TRIGGER update_placements_updated_at
  BEFORE UPDATE ON public.placements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Update jobs table to allow recruiters to post jobs for their clients
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

-- Update jobs RLS policy to allow recruiters to manage jobs for their clients
DROP POLICY IF EXISTS "Recruiters can manage client jobs" ON public.jobs;
CREATE POLICY "Recruiters can manage client jobs"
  ON public.jobs FOR ALL
  USING (
    auth.uid() = created_by 
    OR (
      client_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.clients 
        WHERE clients.id = jobs.client_id 
        AND clients.recruiter_id = auth.uid()
      )
    )
  );