-- Fix security warnings by setting search_path on functions

ALTER FUNCTION public.award_community_points(uuid, text, integer, jsonb) SET search_path = public;
ALTER FUNCTION public.check_community_achievements(uuid) SET search_path = public;
ALTER FUNCTION public.handle_new_post() SET search_path = public;
ALTER FUNCTION public.handle_new_comment() SET search_path = public;
ALTER FUNCTION public.handle_new_reaction() SET search_path = public;