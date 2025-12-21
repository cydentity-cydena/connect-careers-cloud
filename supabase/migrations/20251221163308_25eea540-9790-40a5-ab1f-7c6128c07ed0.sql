-- Add RLS policies for admin management of partner communities

-- Allow admins to insert partner communities
CREATE POLICY "Admins can insert partner communities"
ON public.partner_communities
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update partner communities
CREATE POLICY "Admins can update partner communities"
ON public.partner_communities
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete partner communities
CREATE POLICY "Admins can delete partner communities"
ON public.partner_communities
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Also allow admins to view all communities (including inactive ones)
CREATE POLICY "Admins can view all partner communities"
ON public.partner_communities
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));