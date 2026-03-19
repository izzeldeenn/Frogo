-- Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
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
CREATE TABLE IF NOT EXISTS friendship_requests (
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
CREATE TABLE IF NOT EXISTS messages (
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
CREATE INDEX IF NOT EXISTS idx_friendships_user1 ON friendships(user1_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user2 ON friendships(user2_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

CREATE INDEX IF NOT EXISTS idx_friendship_requests_sender ON friendship_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friendship_requests_receiver ON friendship_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friendship_requests_status ON friendship_requests(status);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON messages(read_at);
CREATE INDEX IF NOT EXISTS idx_messages_deleted ON messages(is_deleted);

-- Create view for conversations (last message between each pair of users)
CREATE OR REPLACE VIEW conversations AS
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
CREATE OR REPLACE FUNCTION update_updated_at_column()
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

-- Row Level Security (RLS) policies
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for friendships table
CREATE POLICY "Users can view their own friendships" ON friendships
    FOR SELECT USING (
        auth.uid() = user1_id OR 
        auth.uid() = user2_id
    );

CREATE POLICY "Users can insert their friendships" ON friendships
    FOR INSERT WITH CHECK (
        auth.uid() = user1_id OR 
        auth.uid() = user2_id
    );

CREATE POLICY "Users can update their friendships" ON friendships
    FOR UPDATE USING (
        auth.uid() = user1_id OR 
        auth.uid() = user2_id
    );

CREATE POLICY "Users can delete their friendships" ON friendships
    FOR DELETE USING (
        auth.uid() = user1_id OR 
        auth.uid() = user2_id
    );

-- RLS policies for friendship_requests table
CREATE POLICY "Users can view requests involving them" ON friendship_requests
    FOR SELECT USING (
        auth.uid() = sender_id OR 
        auth.uid() = receiver_id
    );

CREATE POLICY "Users can send requests" ON friendship_requests
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
    );

CREATE POLICY "Users can update requests they received" ON friendship_requests
    FOR UPDATE USING (
        auth.uid() = receiver_id
    );

CREATE POLICY "Users can delete requests they sent" ON friendship_requests
    FOR DELETE USING (
        auth.uid() = sender_id
    );

-- RLS policies for messages table
CREATE POLICY "Users can view their messages" ON messages
    FOR SELECT USING (
        auth.uid() = sender_id OR 
        auth.uid() = receiver_id
    );

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
    );

CREATE POLICY "Users can update their sent messages" ON messages
    FOR UPDATE USING (
        auth.uid() = sender_id
    );

CREATE POLICY "Users can delete their sent messages" ON messages
    FOR DELETE USING (
        auth.uid() = sender_id
    );
