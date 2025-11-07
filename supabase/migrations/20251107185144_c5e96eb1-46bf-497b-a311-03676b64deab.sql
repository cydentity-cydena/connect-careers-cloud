-- Enable realtime for verification_requests table so admins get notified of new submissions
ALTER PUBLICATION supabase_realtime ADD TABLE verification_requests;