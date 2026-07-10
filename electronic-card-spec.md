# 電子卡片專案 — Claude Code 執行規格書

> 這份文件已經完成所有設計決策確認，請依照本文件完整建置、開發、部署此專案。
> 若遇到本文件沒提到的細節，優先參考「開發原則」章節的判斷邏輯，不確定再詢問 Claire。

---

## 0. 前置手動步驟（Claire 需先完成，Claude Code 無法代勞）

Supabase 的 anon key 無法執行 DDL（建表語法），以下 SQL 必須由 Claire 手動到 Supabase SQL Editor 執行一次，**Claude Code 開始開發前請先確認這步驟已完成**：

```sql
-- ============================================
-- 電子卡片功能 資料表建立（安全加強版）
-- ============================================

CREATE TABLE ecard_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_key UUID DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  style TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  cover_photo_url TEXT,
  blessing_message TEXT,
  show_blessing BOOLEAN DEFAULT false,
  creator_signature TEXT,
  show_signature BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ecard_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES ecard_cards(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT,
  photo_url TEXT,
  layout_seed FLOAT DEFAULT random(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ecard_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecard_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "任何人可讀取卡片" ON ecard_cards FOR SELECT USING (true);
CREATE POLICY "任何人可建立卡片" ON ecard_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "任何人可讀取留言" ON ecard_messages FOR SELECT USING (true);
CREATE POLICY "任何人可新增留言" ON ecard_messages FOR INSERT WITH CHECK (true);
-- 刻意不開放 UPDATE / DELETE 的 POLICY，修改刪除只能透過下方安全函式進行

CREATE OR REPLACE FUNCTION edit_message(
  p_message_id UUID, p_admin_key UUID, p_content TEXT, p_photo_url TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE key_matches BOOLEAN;
BEGIN
  SELECT (c.admin_key = p_admin_key) INTO key_matches
  FROM ecard_messages m JOIN ecard_cards c ON c.id = m.card_id
  WHERE m.id = p_message_id;
  IF key_matches IS NOT TRUE THEN RETURN false; END IF;
  UPDATE ecard_messages SET content = p_content, photo_url = p_photo_url, updated_at = now()
  WHERE id = p_message_id;
  RETURN true;
END; $$;

CREATE OR REPLACE FUNCTION delete_message(
  p_message_id UUID, p_admin_key UUID
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE key_matches BOOLEAN;
BEGIN
  SELECT (c.admin_key = p_admin_key) INTO key_matches
  FROM ecard_messages m JOIN ecard_cards c ON c.id = m.card_id
  WHERE m.id = p_message_id;
  IF key_matches IS NOT TRUE THEN RETURN false; END IF;
  DELETE FROM ecard_messages WHERE id = p_message_id;
  RETURN true;
END; $$;

GRANT EXECUTE ON FUNCTION edit_message TO anon;
GRANT EXECUTE ON FUNCTION delete_message TO anon;
```

同時需要在 Supabase 建立一個 **Storage bucket**，名稱 `ecard-photos`，設為公開讀取（public read），用來存放封面照片與留言照片。

---

## 1. 專案總覽

一個可分享連結的協作式電子卡片。建立者選定類別與風格、設定收件人資訊後產生連結；任何拿到連結的人都可以在卡片上留言並附上照片，畫面呈現手作拼貼質感。建立者另外持有一組管理連結，可修改或刪除任何留言。

**目標使用者**：一般民眾，非科班、不需教學就要能上手，手機為主要使用裝置。

---

## 2. 技術棧

- **前端**：React + Vite（比照既有 `kids-points` 專案架構）
- **資料庫**：Supabase 專案 `claire-agent`（ID：`tpvhouihekekcgybnzgb`），資料表前綴 `ecard_`
- **照片儲存**：Supabase Storage，bucket 名稱 `ecard-photos`
- **部署**：GitHub Pages，新建 repo（建議名稱 `ecard`），部署路徑對應 `https://claire30212.github.io/ecard/`
- **路由**：因 GitHub Pages 為靜態託管，使用 hash routing 或 query string 方式處理路由，避免直接進入子路徑出現 404

---

## 3. 分享連結規則

- 訪客連結（分享給親友）：`https://claire30212.github.io/ecard/?id={card_id}`
- 管理連結（僅建立者持有）：`https://claire30212.github.io/ecard/?id={card_id}&admin={admin_key}`
- 建立卡片完成後，畫面需同時清楚顯示這兩組連結，並標明「訪客連結可分享」「管理連結請自己保存，不要外流」，各附一鍵複製按鈕

---

## 4. 頁面規劃

### 4.1 建立卡片頁（首頁 `/`）
步驟式精靈（Step Wizard），依序：
1. 選擇類別：生日 / 紀念日 / 祝福 / 感謝
2. 選擇質感風格：紙張拼貼風 / 水彩渲染風 / 插畫手繪風
3. 設定封面：
   - 收件人姓名（必填文字輸入）
   - 祝福語（選填文字輸入 + 顯示開關）
   - 建立者署名（選填文字輸入 + 顯示開關）
   - 封面照片（可上傳，或選擇系統內建插畫底圖，兩者擇一，皆可留空最終用手寫姓名當主視覺）
4. 產生連結頁：顯示訪客連結與管理連結，附複製按鈕與「前往查看卡片」按鈕

### 4.2 卡片檢視頁（`/?id=xxx`）
- 進入先顯示**封面**（見第 6 節封面設計規則）
- 封面下方有引導提示（手繪風小箭頭 + 文字，例如「往下滑開卡片」）
- 滑動或點擊後進入**留言拼貼牆**：
  - 顯示所有現有留言（文字 + 可能附帶照片），依第 7 節排列邏輯呈現
  - 沒有任何留言時，顯示空白卡紙引導畫面（見第 8 節 Empty State）
  - 頁面固定或浮動一個「新增留言」按鈕，點擊開啟留言表單（姓名 + 文字 + 可選照片上傳）
  - 新留言送出後即時出現在拼貼牆上，並帶入場動畫（見第 9 節微互動）

### 4.3 管理頁（`/?id=xxx&admin=yyy`）
- 與卡片檢視頁相同的拼貼牆畫面，但每則留言額外顯示「編輯」「刪除」按鈕
- 刪除需二次確認（避免手滑誤刪）
- 若網址帶的 `admin` 參數與資料庫中的 `admin_key` 不符，視同一般訪客頁面處理（不顯示管理功能，不報錯提示，避免洩漏是否存在管理密鑰的線索）

---

## 5. 色彩計畫（依類別）

| 類別 | 主色 | 輔色 | 點綴色 |
|---|---|---|---|
| 生日 birthday | 米白 `#F5F0EB` | 蜜桃橘 `#E8B4A0` | 奶茶棕 `#C9A97E` |
| 紀念日 anniversary | 霧玫瑰 `#D4B5A8` | 煙藍 `#9BAEBE` | 酒紅霧色 `#B08B85` |
| 祝福 blessing | 鼠尾草綠 `#A8B5A2` | 米白 `#F5F0EB` | 淺灰藍 `#B8C4CC` |
| 感謝 thanks | 燕麥色 `#D9CFC1` | 焦糖 `#B8926A` | 深棕 `#8B6F5C` |

字型：優雅輕盈，細字重（Light / Regular），標題可搭配手寫感字體（如 Google Fonts 的 `Caveat` 或中文手寫感字體）。

---

## 6. 質感風格規則（3 種，建立者可選）

- **紙張拼貼風 paper_collage**：卡片背景做出淡淡紙紋理，留言以「便利貼／小卡片」呈現，四角帶膠帶或迴紋針裝飾細節，照片加方形白邊相框
- **水彩渲染風 watercolor**：卡片背景使用柔邊漸層色塊，留言卡片邊緣做柔邊暈染處理（可用 CSS 濾鏡或 SVG 模擬），照片邊緣做柔邊消融效果
- **插畫手繪風 illustration**：卡片元素使用線條感手繪風裝飾（如手繪星星、線條愛心），留言卡片邊框為手繪畫框線條，照片外框同樣是手繪畫框樣式

---

## 7. 封面設計規則

- 姓名為必填，一律顯示，字體使用手寫感字體，作為視覺焦點
- 祝福語、建立者署名皆為選填 + 開關控制，關閉時完全不渲染該區塊
- **有上傳封面照片**：依所選質感風格套用對應相框效果（紙張拼貼＝膠帶方框／水彩渲染＝柔邊暈染／插畫手繪＝手繪畫框），姓名疊加於照片下方或角落
- **未上傳照片，選擇系統內建插畫底圖**：依類別提供對應插畫底圖（例如生日類別的插畫需與生日主題相關），姓名疊加其上
- **完全未提供照片或插畫**：以大面積手寫感姓名文字「給 {姓名}」作主視覺，搭配類別對應的簡單線條裝飾元素

---

## 8. 照片排列邏輯

- **生日、感謝** → 拍立得排列：帶白色相框、隨機小角度傾斜（建議 ±3 到 8 度區間）
- **紀念日、祝福** → 隨機散落拼貼：輕微重疊、不規則角度與位置
- 排列所需的隨機參數（角度、位置偏移）由資料表 `layout_seed` 欄位固定，確保同一則留言每次載入畫面時排列位置一致，不會每次重整頁面就亂跳動
- 照片上傳前需在前端做壓縮處理（建議長邊壓縮至 1200px 內、品質 80% 左右），避免占用過多 Storage 空間與拖慢載入速度

---

## 9. 微互動細節

- 新留言送出時，做出「便利貼貼上去」的輕微彈跳進場動畫
- 照片上傳完成顯示時，做拍立得顯影效果（模糊到清晰淡入，約 1.5 秒）
- 卡片元素 hover／觸控時微微放大並加深陰影
- 按鈕與輸入框需有 hover、active、disabled 三種狀態的配色區分，統一使用對應類別色系的深淺變化，不额外引入不相關顏色

---

## 8. Empty State（無留言時）

不顯示「尚無資料」等制式文字。改為呈現一張視覺上「還沒被寫過的空白卡紙」，中央置中一行手寫感引導文字（例如「還沒有人留言，當第一個祝福 {姓名} 的人吧」），搭配淡淡的裝飾元素，維持卡片的溫度感。

---

## 10. RWD 原則

- Mobile-first：先完成手機版（單欄，留言直向堆疊捲動），再用 media query 依序適配平板（768px）與桌機（1024px，拼貼牆可改為多欄網格排列）
- 交付前需確認手機、平板、桌機三種尺寸皆正常顯示，無跑版、無元素重疊、觸控範圍足夠（按鈕最小觸控區域比照一般標準，不小於 44 x 44 px）

---

## 11. 開發原則（本文件未涵蓋的細節，依此判斷）

- 優先使用現有工具與服務，不引入本文件未提及的新付費服務
- 遇到技術限制或本文件邏輯衝突之處，先用最貼近手作卡片溫度感、對使用者最直覺的方式處理，並在完成後列出處理方式供 Claire 確認
- 所有頁面文字使用繁體中文，UI 不使用任何 emoji
- 部署完成後需自行驗證：連結可正常開啟、留言可成功新增與顯示、管理連結可成功編輯與刪除、三種裝置尺寸皆正常
- 完成後請列出：這版的限制與潛在問題、下一步可優化的方向
