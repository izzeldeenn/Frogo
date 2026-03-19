-- Drop existing objects to recreate them properly
DROP TRIGGER IF EXISTS update_friendship_requests_updated_at ON friendship_requests;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP VIEW IF EXISTS conversations;

-- Drop and recreate tables
DROP TABLE IF EXISTS friendships CASCADE;
DROP TABLE IF EXISTS friendship_requests CASCADE;
DROP TABLE IF EXISTS messages CASCADE;

-- Create friendships table
CREATE TABLE friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
    
    -- Ensure uniqueness of friendship pairs
    UNIQUE(user1_id, user2_id),
    
    -- Prevent users from being friends with themselves
    CHECK(user1_id != user2_id)
);

-- Create friendship_requests table
CREATE TABLE friendship_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure uniqueness of pending requests between same users
    UNIQUE(sender_id, receiver_id, status),
    
    -- Prevent users from sending requests to themselves
    CHECK(sender_id != receiver_id)
);

-- Create messages table
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT false
);

-- Create indexes for better performance
CREATE INDEX idx_friendships_user1 ON friendships(user1_id);
CREATE INDEX idx_friendships_user2 ON friendships(user2_id);
CREATE INDEX idx_friendships_status ON friendships(status);

CREATE INDEX idx_friendship_requests_sender ON friendship_requests(sender_id);
CREATE INDEX idx_friendship_requests_receiver ON friendship_requests(receiver_id);
CREATE INDEX idx_friendship_requests_status ON friendship_requests(status);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_read_at ON messages(read_at);
CREATE INDEX idx_messages_deleted ON messages(is_deleted);

-- Create view for conversations (last message between each pair of users)
CREATE VIEW conversations AS
SELECT DISTINCT ON (
    LEAST(sender_id, receiver_id), 
    GREATEST(sender_id, receiver_id)
)
    LEAST(sender_id, receiver_id) as user1_id,
    GREATEST(sender_id, receiver_id) as user2_id,
    content as last_message,
    created_at as last_message_at,
    sender_id as last_message_sender_id,
    CASE 
        WHEN receiver_id = LEAST(sender_id, receiver_id) THEN sender_id
        ELSE receiver_id
    END as other_user_id
FROM messages 
WHERE is_deleted = false
ORDER BY 
    LEAST(sender_id, receiver_id), 
    GREATEST(sender_id, receiver_id),
    created_at DESC;

-- Function to automatically update updated_at timestamp
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on friendship_requests
CREATE TRIGGER update_friendship_requests_updated_at
    BEFORE UPDATE ON friendship_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Disable RLS for now (will enable later with proper auth)
ALTER TABLE friendships DISABLE ROW LEVEL SECURITY;
ALTER TABLE friendship_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
