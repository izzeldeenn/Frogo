-- Disable RLS for all friendship tables
ALTER TABLE friendships DISABLE ROW LEVEL SECURITY;
ALTER TABLE friendship_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Also disable RLS for conversations view if it exists
DROP VIEW IF EXISTS conversations;

-- Recreate conversations view without RLS restrictions
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
