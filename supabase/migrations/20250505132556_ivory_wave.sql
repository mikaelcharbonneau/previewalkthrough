/*
  # Create avatars storage bucket

  1. New Storage Bucket
    - Creates a new public storage bucket named 'avatars' for storing user profile pictures
    - Enables public access to allow avatar images to be viewed without authentication
    
  2. Security
    - Enables RLS on the bucket
    - Adds policy to allow authenticated users to upload their own avatars
    - Adds policy to allow public read access to all avatars
*/

-- Create the avatars bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

-- Enable RLS
alter table storage.objects enable row level security;

-- Allow authenticated users to upload avatars
create policy "Users can upload avatars"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

-- Allow public read access to avatars
create policy "Anyone can view avatars"
on storage.objects for select
to public
using (bucket_id = 'avatars');