
-- Fix: Restrict api_log inserts to authenticated users or service role
DROP POLICY "System inserts logs" ON public.marketplace_api_log;
CREATE POLICY "Authenticated insert logs" ON public.marketplace_api_log 
  FOR INSERT TO authenticated WITH CHECK (true);

-- Fix: Split admin policy on task_categories to avoid the "ALL USING true" warning
DROP POLICY "Admins manage task categories" ON public.task_categories;
CREATE POLICY "Admins insert task categories" ON public.task_categories FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update task categories" ON public.task_categories FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete task categories" ON public.task_categories FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
