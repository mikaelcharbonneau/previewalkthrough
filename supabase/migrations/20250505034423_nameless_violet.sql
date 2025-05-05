/*
  # Create Walkthrough Users table

  1. New Tables
    - `walkthrough_users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `role` (text)
      - `created_at` (timestamp with time zone)
      - `last_inspection_date` (timestamp with time zone)

  2. Security
    - Enable RLS on `walkthrough_users` table
    - Add policy for authenticated users to read their own data
    - Add policy for authenticated users to update their own data
*/

CREATE TABLE IF NOT EXISTS walkthrough_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_inspection_date timestamptz
);

ALTER TABLE walkthrough_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON walkthrough_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON walkthrough_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);