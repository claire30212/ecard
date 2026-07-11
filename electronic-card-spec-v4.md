# 電子卡片專案 — 第四輪修改規格書

> 此文件為前三份規格書(v1、v2、v3)的補充修正,請一併參考。
> 本輪處理三件事:① 貼紙裝飾功能(建立者裝飾整張卡片 + 訪客留言可加小貼紙)
> ② 管理模式增加「編輯卡片設定」功能(封面、風格、色系事後可調整)
> ③ 底色改為多元選擇(預設色系組合 + 自訂微調)

> 開發原則提醒:本輪以「穩定可用」為最高原則,優先確保功能在手機/平板/桌機
> 三種尺寸下都不出錯、不跑版,不需要做到花俏或視覺效果最大化。

---

## 1. 貼紙裝飾功能

### 1.1 範圍與權限
- **建立者/管理者**(透過管理連結進入):可以在整張卡片(封面 + 留言拼貼牆背景)
  自由擺放貼紙,裝飾整體外觀
- **留言的訪客**:留言時,除了文字與照片,可額外選擇**一個**小貼紙加在自己
  的留言卡片一角,增加互動樂趣(限制只能選一個,不做多個貼紙疊加,避免留言卡
  被貼紙蓋住文字內容)
- 不做手繪畫筆功能(拖拉現成貼紙圖案即可,不需要即時手繪線條)

### 1.2 技術做法:相對定位,避免跨裝置跑版
貼紙位置一律以「相對背景的百分比座標」儲存與呈現(例如 x: 32%, y: 58%),
**不要使用絕對像素座標**,否則手機/平板/桌機三種版面配置不同,貼紙位置會
跟著跑掉,甚至可能疊到留言卡片上擋住文字內容。

貼紙資料結構建議(存在 `ecard_cards` 資料表新增欄位):

```sql
ALTER TABLE ecard_cards
ADD COLUMN decorations JSONB DEFAULT '[]'::jsonb;
-- 格式範例:
-- [{"sticker_id": "heart_01", "x_percent": 32.5, "y_percent": 58.0,
--   "rotation": -8, "scale": 1.0}, ...]
```

```sql
ALTER TABLE ecard_messages
ADD COLUMN sticker_id TEXT;
-- 單一貼紙 ID，留空代表訪客沒有選貼紙
```

### 1.3 貼紙素材
請準備一組簡單的貼紙圖案庫(SVG 為佳),數量抓 15 ~ 20 個左右即可,涵蓋常見
主題(愛心、星星、緞帶、花朵、氣球、掌印、膠帶造型、簡單手繪符號等),
風格上需要能搭配三種質感風格(紙張拼貼／水彩渲染／插畫手繪)不顯突兀,
不需要每種風格各出一套,同一套簡約線條風格能通用最好,以控制開發時間。

### 1.4 操作方式
- 建立者裝飾:在建立卡片精靈流程的最後、或管理模式畫面新增一個「裝飾卡片」
  的編輯區塊,提供貼紙清單,點選後可拖拉到畫面上想要的位置,完成後儲存
- 訪客留言:在留言表單裡,文字與照片欄位下方,新增一個「加個小貼紙」的
  選填區塊,提供貼紙清單供點選(不需要拖拉定位,固定顯示在留言卡片角落即可,
  降低操作複雜度、提高成功率)

### 1.5 驗證要求
完成後請務必用手機、平板、桌機三種寬度分別確認貼紙沒有跑位、沒有遮擋
留言文字或按鈕,且管理者裝飾的貼紙、訪客留言的貼紙,在三種裝置上顯示位置
一致合理。

---

## 2. 管理模式:卡片設定可事後編輯

目前建立卡片後,收件人姓名、質感風格、封面照片/插畫、祝福語、署名等設定
一旦產生連結後就無法修改,這不符合實際使用情境(常常事後想調整封面)。

### 2.1 新增功能
管理連結(帶 `admin` 參數)進入的畫面,除了現有的留言編輯/刪除功能,
新增一個「編輯卡片設定」的入口,可以重新調整:

- 質感風格(紙張拼貼／水彩渲染／插畫手繪)
- 封面主視覺(不使用照片／上傳照片／內建插畫,以及底色與色系,見第 3 節)
- 祝福語內容與顯示開關
- 建立者署名內容與顯示開關

### 2.2 安全性做法
沿用既有的 `admin_key` 驗證邏輯,修改設定一樣要走 `SECURITY DEFINER` 的
資料庫函式(比照 `edit_message` / `delete_message` 的做法),確認 `admin_key`
正確才允許更新,不要開放資料表層級的 UPDATE 給任何人。

```sql
CREATE OR REPLACE FUNCTION edit_card_settings(
  p_card_id UUID, p_admin_key UUID,
  p_style TEXT, p_cover_photo_url TEXT,
  p_blessing_message TEXT, p_show_blessing BOOLEAN,
  p_creator_signature TEXT, p_show_signature BOOLEAN,
  p_color_theme TEXT, p_decorations JSONB
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
    color_theme = p_color_theme, decorations = p_decorations
  WHERE id = p_card_id;
  RETURN true;
END; $$;

GRANT EXECUTE ON FUNCTION edit_card_settings TO anon;
```

（若欄位名稱與既有資料表不完全一致，請以實際資料表結構為準調整此函式）

---

## 3. 底色多元選擇

### 3.1 設計方式
提供 **4 組預設色系組合**供選擇,涵蓋不同氛圍與適用對象,每組各自包含
主色、輔色、點綴色三個層次(比照既有規格文件的色彩計畫結構):

| 色系名稱 | 適合情境 | 主色 | 輔色 | 點綴色 |
|---|---|---|---|---|
| 溫馨系 | 長輩、溫暖祝福 | 米白 `#F5F0EB` | 蜜桃橘 `#E8B4A0` | 奶茶棕 `#C9A97E` |
| 清爽系 | 年輕人、清新風格 | 淺灰藍 `#B8C4CC` | 鼠尾草綠 `#A8B5A2` | 米白 `#F5F0EB` |
| 沉穩系 | 男性、正式場合 | 燕麥色 `#D9CFC1` | 深棕 `#8B6F5C` | 焦糖 `#B8926A` |
| 童趣系 | 小孩、活潑可愛 | 米白 `#F5F0EB` | 粉膚色 `#F0C9B8` | 淺水藍 `#BFDCE0` |

選定色系組合後,允許在**同一色系內微調明暗深淺**(例如提供一個滑桿微調
整體亮度或飽和度),而非開放完整色票選色盤,避免使用者不小心調出不協調
的配色組合。

### 3.2 資料庫異動

```sql
ALTER TABLE ecard_cards
ADD COLUMN color_theme TEXT DEFAULT 'warm';
-- 可能值: warm(溫馨系) / fresh(清爽系) / calm(沉穩系) / playful(童趣系)

ALTER TABLE ecard_cards
ADD COLUMN color_adjust FLOAT DEFAULT 0;
-- 明暗微調數值，範圍建議 -20 到 20，代表在該色系基礎上加深或加亮的程度
```

### 3.3 與既有類別色彩的關係
原本規格文件依「類別」(生日/紀念日/祝福/感謝)決定顏色,本輪改為使用者
可以在建立卡片時**自行選擇色系組合**,不再強制綁定類別。建議做法:
建立卡片精靈時,依「類別」預先帶入一組建議色系(例如生日預設帶入溫馨系),
但使用者可以自由更換成其他 3 組色系中的任一組,不受類別限制。

---

## 4. 完成後請提供

- 貼紙裝飾功能的操作截圖(建立者裝飾整張卡片、訪客留言加小貼紙),
  並附上手機/平板/桌機三種尺寸下貼紙沒有跑位遮擋的驗證截圖
- 管理模式「編輯卡片設定」的操作截圖
- 四組底色系選擇畫面的截圖
- 依照第三輪規格書要求,實際打開瀏覽器開發者工具確認 Console/Network
  沒有錯誤,才能回報完成
- 限制與下一步總結
