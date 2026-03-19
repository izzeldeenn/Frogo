-- Just disable RLS without recreating tables
ALTER TABLE friendships DISABLE ROW LEVEL SECURITY;
ALTER TABLE friendship_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
