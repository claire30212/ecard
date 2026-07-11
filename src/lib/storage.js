import { supabase } from './supabase'
import { compressImage } from './compressImage'

const BUCKET = 'ecard-photos'

// 讓呼叫端可以區分「照片上傳階段」失敗跟其他失敗（例如送出留言本身失敗），
// 才能顯示對應的友善錯誤訊息，而不是籠統的「送出失敗」
export class PhotoUploadError extends Error {
  constructor(message) {
    super(message)
    this.name = 'PhotoUploadError'
  }
}

// 壓縮後上傳到 ecard-photos bucket，回傳公開讀取 URL
export async function uploadPhoto(file, folder) {
  let compressed
  try {
    compressed = await compressImage(file)
  } catch (err) {
    throw new PhotoUploadError(err.message || '照片上傳失敗，請再試一次')
  }

  const path = `${folder}/${crypto.randomUUID()}.jpg`
  const { error } = await supabase.storage.from(BUCKET).upload(path, compressed, {
    contentType: 'image/jpeg',
    cacheControl: '31536000',
  })
  if (error) throw new PhotoUploadError('照片上傳失敗，請再試一次')
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
