-- Add read_at timestamp to direct_messages if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'direct_messages' AND column_name = 'read_at'
  ) THEN
    ALTER TABLE direct_messages ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Enable realtime for direct_messages
ALTER PUBLICATION supabase_realtime ADD TABLE direct_messages;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient 
  ON direct_messages(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation 
  ON direct_messages(sender_id, recipient_id, created_at DESC);

-- Function to mark message as read
CREATE OR REPLACE FUNCTION mark_message_read(message_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE direct_messages
  SET is_read = true, read_at = NOW()
  WHERE id = message_id AND recipient_id = auth.uid();
END;
$$;