/*
  # Update walkthrough_users table and policies

  1. Changes
    - Creates walkthrough_users table if it doesn't exist
    - Ensures RLS is enabled
    - Drops existing policies before recreating them
    - Creates trigger for updated_at column
*/

-- Create the walkthrough_users table
CREATE TABLE IF NOT EXISTS public.walkthrough_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text NOT NULL UNIQUE,
  role text DEFAULT 'user',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.walkthrough_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON public.walkthrough_users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.walkthrough_users;

-- Create policies
CREATE POLICY "Users can read own profile"
  ON public.walkthrough_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.walkthrough_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_walkthrough_users_updated_at ON public.walkthrough_users;

-- Create the trigger
CREATE TRIGGER update_walkthrough_users_updated_at
  BEFORE UPDATE ON public.walkthrough_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();