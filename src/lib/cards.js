import { supabase } from './supabase'

// 訪客／留言頁一律查詢 ecard_cards_public 視圖，不含 admin_key、creator_id，
// 避免一般查詢就能撈出管理金鑰（原表已收緊為僅本人可讀）
export async function fetchCard(cardId) {
  const { data, error } = await supabase
    .from('ecard_cards_public')
    .select('id, category, style, recipient_name, cover_photo_url, blessing_message, show_blessing, creator_signature, show_signature, created_at')
    .eq('id', cardId)
    .maybeSingle()
  if (error) throw error
  return data
}

// 管理連結驗證改走 SECURITY DEFINER 函式比對 admin_key，比對成功才回傳卡片資料，
// 前端不再直接查表撈 admin_key
export async function verifyAdminKey({ cardId, adminKey }) {
  const { data, error } = await supabase
    .rpc('verify_admin_key', { p_card_id: cardId, p_admin_key: adminKey })
    .maybeSingle()
  if (error) throw error
  return data || null
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

// 「我的卡片」列表：RLS 已限定只能查到 creator_id = auth.uid() 的卡片，
// 用 PostgREST embed 一併帶出各卡片的留言數
export async function fetchMyCards() {
  const { data, error } = await supabase
    .from('ecard_cards')
    .select('id, category, style, recipient_name, admin_key, created_at, ecard_messages(count)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map((row) => ({
    ...row,
    messageCount: row.ecard_messages?.[0]?.count ?? 0,
  }))
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
