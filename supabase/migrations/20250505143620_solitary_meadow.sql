/*
  # Create walkthrough_users table

  1. New Tables
    - `walkthrough_users`
      - `id` (uuid, primary key) - matches auth.users.id
      - `name` (text) - user's full name
      - `email` (text) - user's email address
      - `role` (text) - user's role in the system
      - `avatar_url` (text) - URL to user's profile picture
      - `created_at` (timestamptz) - when the user was created
      - `updated_at` (timestamptz) - when the user was last updated

  2. Security
    - Enable RLS on `walkthrough_users` table
    - Add policies for:
      - Users can read their own profile
      - Users can update their own profile
      - New users are automatically created via trigger
*/

-- Create the walkthrough_users table
CREATE TABLE IF NOT EXISTS public.walkthrough_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text,
  email text UNIQUE NOT NULL,
  role text DEFAULT 'user',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.walkthrough_users ENABLE ROW LEVEL SECURITY;

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

-- Create trigger to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.walkthrough_users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_walkthrough_users_updated_at
  BEFORE UPDATE ON public.walkthrough_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();