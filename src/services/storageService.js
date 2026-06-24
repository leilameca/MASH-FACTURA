import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { generateUuid } from '../lib/utils';

export async function uploadFile(bucket, file, folder = 'uploads') {
  if (!file) return null;
  if (!isSupabaseConfigured) {
    throw new Error('Configura Supabase para subir archivos.');
  }

  const extension = file.name.split('.').pop();
  const path = `${folder}/${generateUuid()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}
