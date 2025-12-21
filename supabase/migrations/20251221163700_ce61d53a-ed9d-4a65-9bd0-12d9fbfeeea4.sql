-- Add Discord server ID column for widget API integration
ALTER TABLE public.partner_communities
ADD COLUMN discord_server_id TEXT;