import { supabase } from './supabase'
import { compressImage } from './compressImage'

const BUCKET = 'ecard-photos'

// 壓縮後上傳到 ecard-photos bucket，回傳公開讀取 URL
export async function uploadPhoto(file, folder) {
  const compressed = await compressImage(file)
  const path = `${folder}/${crypto.randomUUID()}.jpg`
  const { error } = await supabase.storage.from(BUCKET).upload(path, compressed, {
    contentType: 'image/jpeg',
    cacheControl: '31536000',
  })
  if (error) throw error
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
