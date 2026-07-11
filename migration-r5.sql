-- 第五輪修改：留言拼貼牆換排列方式
-- 請到 Supabase SQL Editor 貼上整段執行一次

ALTER TABLE ecard_cards ADD COLUMN layout_style TEXT DEFAULT 'collage';
-- 可能值: collage(緊密拼貼) / loose(鬆散錯落) / timeline(依時間整齊排列) / grouped(依有無照片分區)

CREATE OR REPLACE VIEW ecard_cards_public AS
SELECT id, category, style, recipient_name, cover_photo_url,
       blessing_message, show_blessing, creator_signature,
       show_signature, created_at, color_theme, color_adjust, decorations,
       layout_style
FROM ecard_cards;

-- 參數列表變了＝不同函式簽章，先砍掉舊的避免留下不會再被呼叫、卻仍可執行的殭屍版本
DROP FUNCTION IF EXISTS edit_card_settings(UUID, UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT, BOOLEAN, TEXT, FLOAT, JSONB);

CREATE OR REPLACE FUNCTION edit_card_settings(
  p_card_id UUID, p_admin_key UUID,
  p_style TEXT, p_cover_photo_url TEXT,
  p_blessing_message TEXT, p_show_blessing BOOLEAN,
  p_creator_signature TEXT, p_show_signature BOOLEAN,
  p_color_theme TEXT, p_color_adjust FLOAT, p_decorations JSONB,
  p_layout_style TEXT
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
    color_theme = p_color_theme, color_adjust = p_color_adjust, decorations = p_decorations,
    layout_style = p_layout_style
  WHERE id = p_card_id;
  RETURN true;
END; $$;

-- 新簽章要重新 GRANT，兩個角色都要開（R3 的教訓：table-level GRANT／函式 EXECUTE
-- 跟 RLS policy 是分開的關卡，加新角色或改簽章時兩邊都要確認）
GRANT EXECUTE ON FUNCTION edit_card_settings TO anon, authenticated;
