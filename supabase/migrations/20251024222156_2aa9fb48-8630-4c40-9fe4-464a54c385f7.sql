-- Create candidate pods table
CREATE TABLE public.candidate_pods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Create pod members table (which candidates are in which pods)
CREATE TABLE public.pod_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pod_id UUID NOT NULL REFERENCES public.candidate_pods(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(pod_id, candidate_id)
);

-- Create pod assignments table (which employers/recruiters have access to which pods)
CREATE TABLE public.pod_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pod_id UUID NOT NULL REFERENCES public.candidate_pods(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE(pod_id, assigned_to)
);

-- Enable RLS
ALTER TABLE public.candidate_pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for candidate_pods
CREATE POLICY "Admins can manage pods"
ON public.candidate_pods
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view pods"
ON public.candidate_pods
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Employers/recruiters can view assigned pods"
ON public.candidate_pods
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pod_assignments
    WHERE pod_assignments.pod_id = candidate_pods.id
    AND pod_assignments.assigned_to = auth.uid()
    AND (pod_assignments.expires_at IS NULL OR pod_assignments.expires_at > now())
  )
);

-- RLS Policies for pod_members
CREATE POLICY "Admins can manage pod members"
ON public.pod_members
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can manage pod members"
ON public.pod_members
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Employers/recruiters can view pod members in assigned pods"
ON public.pod_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pod_assignments
    WHERE pod_assignments.pod_id = pod_members.pod_id
    AND pod_assignments.assigned_to = auth.uid()
    AND (pod_assignments.expires_at IS NULL OR pod_assignments.expires_at > now())
  )
);

CREATE POLICY "Candidates can see which pods they're in"
ON public.pod_members
FOR SELECT
TO authenticated
USING (auth.uid() = candidate_id);

-- RLS Policies for pod_assignments
CREATE POLICY "Admins can manage pod assignments"
ON public.pod_assignments
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can manage pod assignments"
ON public.pod_assignments
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Users can view their own pod assignments"
ON public.pod_assignments
FOR SELECT
TO authenticated
USING (auth.uid() = assigned_to);

-- Create indexes for performance
CREATE INDEX idx_pod_members_pod_id ON public.pod_members(pod_id);
CREATE INDEX idx_pod_members_candidate_id ON public.pod_members(candidate_id);
CREATE INDEX idx_pod_assignments_pod_id ON public.pod_assignments(pod_id);
CREATE INDEX idx_pod_assignments_assigned_to ON public.pod_assignments(assigned_to);
CREATE INDEX idx_pod_assignments_expires_at ON public.pod_assignments(expires_at);

-- Create updated_at trigger
CREATE TRIGGER update_candidate_pods_updated_at
BEFORE UPDATE ON public.candidate_pods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();