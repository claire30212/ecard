import { supabase } from './supabase'

export async function fetchCard(cardId) {
  const { data, error } = await supabase
    .from('ecard_cards')
    .select('id, category, style, recipient_name, cover_photo_url, blessing_message, show_blessing, creator_signature, show_signature, created_at')
    .eq('id', cardId)
    .maybeSingle()
  if (error) throw error
  return data
}

// admin_key 僅在建立卡片後、產生連結頁時讀取一次，之後只透過網址參數保存，
// 不會再對外查詢（避免任何一般查詢就能撈出 admin_key）
export async function fetchCardAdminKey(cardId) {
  const { data, error } = await supabase
    .from('ecard_cards')
    .select('admin_key')
    .eq('id', cardId)
    .maybeSingle()
  if (error) throw error
  return data?.admin_key || null
}

export async function createCard(payload) {
  const { data, error } = await supabase
    .from('ecard_cards')
    .insert(payload)
    .select('id, admin_key')
    .single()
  if (error) throw error
  return data
}

export async function fetchMessages(cardId) {
  const { data, error } = await supabase
    .from('ecard_messages')
    .select('id, card_id, author_name, content, photo_url, layout_seed, created_at, updated_at')
    .eq('card_id', cardId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function addMessage({ cardId, authorName, content, photoUrl }) {
  const { data, error } = await supabase
    .from('ecard_messages')
    .insert({ card_id: cardId, author_name: authorName, content, photo_url: photoUrl })
    .select('id, card_id, author_name, content, photo_url, layout_seed, created_at, updated_at')
    .single()
  if (error) throw error
  return data
}

export async function editMessage({ messageId, adminKey, content, photoUrl }) {
  const { data, error } = await supabase.rpc('edit_message', {
    p_message_id: messageId,
    p_admin_key: adminKey,
    p_content: content,
    p_photo_url: photoUrl,
  })
  if (error) throw error
  return data === true
}

export async function deleteMessage({ messageId, adminKey }) {
  const { data, error } = await supabase.rpc('delete_message', {
    p_message_id: messageId,
    p_admin_key: adminKey,
  })
  if (error) throw error
  return data === true
}
