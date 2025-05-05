-- Create avatars bucket if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'avatars'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('avatars', 'avatars', true);
  END IF;
END $$;

-- Create policies for avatar management
CREATE POLICY "Avatar upload policy"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  POSITION(auth.uid()::text IN name) = 1
);

CREATE POLICY "Avatar update policy"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'avatars' AND
  POSITION(auth.uid()::text IN name) = 1
);

CREATE POLICY "Avatar delete policy"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars' AND
  POSITION(auth.uid()::text IN name) = 1
);

CREATE POLICY "Avatar read policy"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');