import { supabase } from './supabase'

// 訪客／留言頁一律查詢 ecard_cards_public 視圖，不含 admin_key、creator_id，
// 避免一般查詢就能撈出管理金鑰（原表已收緊為僅本人可讀）
export async function fetchCard(cardId) {
  const { data, error } = await supabase
    .from('ecard_cards_public')
    .select(
      'id, category, style, recipient_name, cover_photo_url, blessing_message, show_blessing, creator_signature, show_signature, created_at, color_theme, color_adjust, decorations, layout_style, recipient_key'
    )
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
    .select('id, admin_key, recipient_key')
    .single()
  if (error) throw error
  return data
}

// 「我的卡片」列表：RLS 已限定只能查到 creator_id = auth.uid() 的卡片，
// 用 PostgREST embed 一併帶出各卡片的留言數
export async function fetchMyCards() {
  const { data, error } = await supabase
    .from('ecard_cards')
    .select('id, category, style, recipient_name, admin_key, recipient_key, created_at, ecard_messages(count)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map((row) => ({
    ...row,
    messageCount: row.ecard_messages?.[0]?.count ?? 0,
  }))
}

// 「我的卡片」列表用登入身份刪除自己的卡片：RLS 直接用 auth.uid() = creator_id
// 判斷權限（R10 新增的 policy），不用像留言刪除那樣額外走 admin_key。
// ecard_messages 對 ecard_cards 的外鍵是 ON DELETE CASCADE，刪卡片時底下的
// 留言會由資料庫自動一併清除
export async function deleteCard(cardId) {
  // 特地帶 .select('id') 確認真的刪到列：純 .delete() 在 RLS 擋下、0 筆符合
  // 條件時不會回傳錯誤，會誤以為刪除成功，帶 select 才能看到實際刪了幾筆
  const { data, error } = await supabase.from('ecard_cards').delete().eq('id', cardId).select('id')
  if (error) throw error
  if (!data || data.length === 0) throw new Error('刪除失敗，請確認這張卡片是否為你本人建立')
}

export async function fetchMessages(cardId) {
  const { data, error } = await supabase
    .from('ecard_messages')
    .select('id, card_id, author_name, content, photo_url, layout_seed, created_at, updated_at, sticker_id, sticker_color')
    .eq('card_id', cardId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function addMessage({ cardId, authorName, content, photoUrl, stickerId, stickerColor }) {
  const { data, error } = await supabase
    .from('ecard_messages')
    .insert({
      card_id: cardId,
      author_name: authorName,
      content,
      photo_url: photoUrl,
      sticker_id: stickerId || null,
      sticker_color: stickerId ? stickerColor || null : null,
    })
    .select('id, card_id, author_name, content, photo_url, layout_seed, created_at, updated_at, sticker_id, sticker_color')
    .single()
  if (error) throw error
  return data
}

// 管理模式「裝飾卡片」／「編輯卡片設定」都走這支 SECURITY DEFINER 函式，
// 兩個 Modal 各自只改自己負責的欄位，其餘欄位用卡片目前的值原樣帶入送出
export async function editCardSettings({
  cardId,
  adminKey,
  style,
  coverPhotoUrl,
  blessingMessage,
  showBlessing,
  creatorSignature,
  showSignature,
  colorTheme,
  colorAdjust,
  decorations,
  layoutStyle,
}) {
  const { data, error } = await supabase.rpc('edit_card_settings', {
    p_card_id: cardId,
    p_admin_key: adminKey,
    p_style: style,
    p_cover_photo_url: coverPhotoUrl,
    p_blessing_message: blessingMessage,
    p_show_blessing: showBlessing,
    p_creator_signature: creatorSignature,
    p_show_signature: showSignature,
    p_color_theme: colorTheme,
    p_color_adjust: colorAdjust,
    p_decorations: decorations,
    p_layout_style: layoutStyle,
  })
  if (error) throw error
  return data === true
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
