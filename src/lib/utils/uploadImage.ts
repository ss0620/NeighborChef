import { supabase } from '@/lib/supabase';

export type PhotoBucket = 'recipe-photos' | 'listing-photos' | 'avatars';

/**
 * Uploads a local image (picked via expo-image-picker) to a Supabase Storage
 * bucket under the current user's folder, and returns its public URL.
 * Storage RLS requires the path's first segment to equal the caller's uid.
 */
export async function uploadImage(bucket: PhotoBucket, userId: string, localUri: string): Promise<string> {
  const arraybuffer = await fetch(localUri).then((res) => res.arrayBuffer());
  const fileExt = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${userId}/${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage.from(bucket).upload(path, arraybuffer, {
    contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
