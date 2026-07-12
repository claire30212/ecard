-- 第十一輪修改：新增「收件人專屬連結」
-- 請到 Supabase SQL Editor 貼上整段執行一次

ALTER TABLE ecard_cards
ADD COLUMN recipient_key UUID DEFAULT gen_random_uuid();

-- recipient_key 不是敏感機密資料（外流最多只是讓陌生人也能用「收件人模式」
-- 檢視卡片，不像 admin_key 有編輯/刪除風險），可以安全地加進公開視圖，
-- 供前端比對網址的 recipient 參數是否正確。視圖欄位清單依目前 R5 之後
-- 的實際版本為準，只在最後補上 recipient_key 這一欄。
DROP VIEW IF EXISTS ecard_cards_public;
CREATE VIEW ecard_cards_public AS
SELECT id, category, style, recipient_name, cover_photo_url,
       blessing_message, show_blessing, creator_signature,
       show_signature, created_at, color_theme, color_adjust, decorations,
       layout_style, recipient_key
FROM ecard_cards;

GRANT SELECT ON ecard_cards_public TO anon;

-- 附帶發現並修復一個從 R2 就存在、這次才浮出來的問題：ecard_cards_public
-- 從建立以來只 GRANT 給 anon，從沒授權給 authenticated。實測發現「已登入」
-- 狀態下（例如在「我的卡片」點自己卡片的「查看」）查這個視圖會直接
-- permission denied，導致已登入的建立者打開自己卡片的任何連結（訪客/
-- 收件人/管理連結）都會看到「找不到這張卡片」——因為一般訪客瀏覽器多半
-- 沒登入用的是 anon 角色才沒踩到這個洞。這次一併補上。
GRANT SELECT ON ecard_cards_public TO authenticated;
