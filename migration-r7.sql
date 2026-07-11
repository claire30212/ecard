-- 第七輪修改：訪客留言小貼紙開放自由選色
-- 請到 Supabase SQL Editor 貼上整段執行一次

ALTER TABLE ecard_messages ADD COLUMN sticker_color TEXT;

-- 說明：
-- 1. 封面/留言牆背景貼紙（ecard_cards.decorations JSONB）的顏色是存在既有
--    JSON 結構裡新增的 color 屬性，不需要異動資料表結構。
-- 2. ecard_messages 沒有像 ecard_cards_public 那樣的公開視圖包裝，新增可為
--    NULL 的欄位不影響現有 RLS 政策或 table-level GRANT，不需要額外授權。
-- 3. 沒有任何函式簽章變動，不需要 DROP FUNCTION / 重新 GRANT。
