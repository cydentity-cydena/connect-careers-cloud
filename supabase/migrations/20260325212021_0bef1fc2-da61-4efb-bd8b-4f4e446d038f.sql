
-- Fix Caesar Cipher description: remove the "(shift 3)" hint
UPDATE public.ctf_challenges 
SET description = 'Decrypt this Caesar cipher: IODJFDHVDU_FLSKHUB'
WHERE id = 'a984fc19-416e-47b3-853f-e955ccbad1c5';

-- Clear stuck participants from BSides event
DELETE FROM public.ctf_event_participants 
WHERE event_id = '522e9029-dbff-41d1-8d72-1c804ced8830';
