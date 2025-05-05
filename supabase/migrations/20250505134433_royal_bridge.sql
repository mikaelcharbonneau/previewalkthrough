-- Drop existing policies if they exist
drop policy if exists "Users can upload avatars" on storage.objects;
drop policy if exists "Anyone can view avatars" on storage.objects;

-- Ensure the avatars bucket exists and is public
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Create more permissive policies for avatar storage
create policy "Authenticated users can upload avatars"
on storage.objects for insert
to authenticated
with check (bucket_id = 'avatars');

create policy "Authenticated users can update their avatars"
on storage.objects for update
to authenticated
using (bucket_id = 'avatars');

create policy "Authenticated users can delete their avatars"
on storage.objects for delete
to authenticated
using (bucket_id = 'avatars');

create policy "Public read access for avatars"
on storage.objects for select
to public
using (bucket_id = 'avatars');