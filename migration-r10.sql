-- 第十輪修改：「我的卡片」列表新增刪除卡片功能
-- 請到 Supabase SQL Editor 貼上整段執行一次

-- ecard_cards 目前只有 SELECT（本人可讀取自己的卡片完整資料）跟 INSERT
-- （登入者可建立卡片）兩條 policy，沒有 DELETE，直接呼叫 delete 會被 RLS
-- 擋下。這裡比照既有「本人」policy 的寫法，直接用 auth.uid() = creator_id
-- 判斷權限，不用像留言刪除那樣額外走 admin_key 比對的 SECURITY DEFINER
-- 函式——因為「我的卡片」本來就是登入後才看得到，登入身份就是最直接的
-- 權限依據。
CREATE POLICY "本人可刪除自己的卡片" ON ecard_cards
FOR DELETE USING (auth.uid() = creator_id);

-- 記取前幾輪教訓：table-level GRANT 跟 RLS policy 是分開的關卡，兩邊都要開。
-- 只開放 authenticated（不含 anon），因為刪除卡片一定要先登入才看得到「我的
-- 卡片」列表，沒有訪客會走到這個操作。
GRANT DELETE ON ecard_cards TO authenticated;

-- ecard_messages 對 ecard_cards 的外鍵是 ON DELETE CASCADE（第一輪就設定好），
-- 刪除 ecard_cards 那一列時，資料庫會自動連帶刪除底下所有留言。這個 CASCADE
-- 動作是以資料表擁有者身份執行（預設沒有開 FORCE ROW LEVEL SECURITY），
-- 會略過 ecard_messages 自己「不開放 DELETE policy」的限制，不需要另外
-- 為 ecard_messages 開權限。
