-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_walkthrough_users_email ON walkthrough_users(email);
CREATE INDEX IF NOT EXISTS idx_walkthrough_users_role ON walkthrough_users(role);

-- Add missing RLS policy
CREATE POLICY "Allow authenticated users to create profiles"
ON public.walkthrough_users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Optimize existing indexes
REINDEX TABLE walkthrough_users;
ANALYZE walkthrough_users;