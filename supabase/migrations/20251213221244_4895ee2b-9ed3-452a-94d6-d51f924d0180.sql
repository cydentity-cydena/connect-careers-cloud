-- Grant SELECT access on the public views for anonymous and authenticated users
GRANT SELECT ON public.ctf_challenges_public TO anon, authenticated;
GRANT SELECT ON public.ctf_leaderboard TO anon, authenticated;