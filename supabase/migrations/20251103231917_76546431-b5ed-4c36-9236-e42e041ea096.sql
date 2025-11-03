-- Add edit tracking to direct_messages
ALTER TABLE direct_messages
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create conversation_archives table for archiving conversations
CREATE TABLE IF NOT EXISTS conversation_archives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  other_user_id UUID NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, other_user_id)
);

-- Enable RLS on conversation_archives
ALTER TABLE conversation_archives ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own archives
CREATE POLICY "Users can manage own archives"
  ON conversation_archives
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update direct_messages RLS to allow senders to update their own messages
CREATE POLICY "Senders can update own messages"
  ON direct_messages
  FOR UPDATE
  USING (auth.uid() = sender_id);

-- Allow senders to soft delete messages
CREATE POLICY "Senders can delete own messages"
  ON direct_messages
  FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);