import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AvatarUploadProps {
  onUpload: (url: string) => void;
  size?: number;
}

export default function AvatarUpload({ onUpload, size = 32 }: AvatarUploadProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const file = acceptedFiles[0];
      const fileExt = file.name.split('.').pop();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      // Create a unique file path under the user's folder
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      // Upload the file
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      onUpload(publicUrl);
    } catch (error) {
      console.error('Error uploading avatar:', error);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div {...getRootProps()} className="absolute inset-0 cursor-pointer">
      <input {...getInputProps()} />
      <div className="absolute inset-0 rounded-full transition-all duration-200 hover:bg-black/50 flex items-center justify-center">
        <Camera 
          className="hidden text-white group-hover:block transition-all duration-200" 
          size={size / 3} 
        />
      </div>
    </div>
  );
}