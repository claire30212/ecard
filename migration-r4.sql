-- 第四輪修改：貼紙裝飾、管理模式編輯卡片設定、底色多元選擇
-- 請到 Supabase SQL Editor 貼上整段執行一次

ALTER TABLE ecard_cards ADD COLUMN decorations JSONB DEFAULT '[]'::jsonb;
ALTER TABLE ecard_cards ADD COLUMN color_theme TEXT DEFAULT 'warm';
ALTER TABLE ecard_cards ADD COLUMN color_adjust FLOAT DEFAULT 0;
ALTER TABLE ecard_messages ADD COLUMN sticker_id TEXT;

-- 訪客查詢用的公開視圖要一併補上新欄位，否則訪客端拿不到色系/貼紙資料
CREATE OR REPLACE VIEW ecard_cards_public AS
SELECT id, category, style, recipient_name, cover_photo_url,
       blessing_message, show_blessing, creator_signature,
       show_signature, created_at, color_theme, color_adjust, decorations
FROM ecard_cards;

CREATE OR REPLACE FUNCTION edit_card_settings(
  p_card_id UUID, p_admin_key UUID,
  p_style TEXT, p_cover_photo_url TEXT,
  p_blessing_message TEXT, p_show_blessing BOOLEAN,
  p_creator_signature TEXT, p_show_signature BOOLEAN,
  p_color_theme TEXT, p_color_adjust FLOAT, p_decorations JSONB
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE key_matches BOOLEAN;
BEGIN
  SELECT (admin_key = p_admin_key) INTO key_matches
  FROM ecard_cards WHERE id = p_card_id;
  IF key_matches IS NOT TRUE THEN RETURN false; END IF;

  UPDATE ecard_cards SET
    style = p_style, cover_photo_url = p_cover_photo_url,
    blessing_message = p_blessing_message, show_blessing = p_show_blessing,
    creator_signature = p_creator_signature, show_signature = p_show_signature,
    color_theme = p_color_theme, color_adjust = p_color_adjust, decorations = p_decorations
  WHERE id = p_card_id;
  RETURN true;
END; $$;

-- 記取第三輪教訓：table-level GRANT 跟函式 EXECUTE 是分開的關卡，
-- 兩個角色都要開，避免已登入的建立者用管理連結時又碰到權限回歸
GRANT EXECUTE ON FUNCTION edit_card_settings TO anon, authenticated;
