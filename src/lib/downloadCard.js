// 下載卡片存檔（PNG），只在收件人專屬連結顯示。動態載入截圖套件，
// 避免所有訪客都要多載入這個套件的體積，只有真的點下載才載入。
// 用 html2canvas-pro 而不是原始 html2canvas：專案 CSS 大量使用
// color-mix()（R9/R10 為了對比度修的一批按鈕/選取狀態），原始 html2canvas
// 的顏色解析器不認得這個較新的 CSS 函式，整頁只要有一處 color-mix() 就會
// 直接拋錯、整張截圖失敗；html2canvas-pro 是專門修過這塊的維護分支
function sanitizeFilename(name) {
  return (name || '卡片').replace(/[<>:"/\\|?*]/g, '')
}

// 在 onclone 複製出來的那份「跟畫面上活著的 DOM 無關」的文件裡，把每張
// <img> 的 src 換成用 fetch() 自己抓回來的 blob URL。特地不直接改畫面上
// 活著的 <img>：那樣做會跟 React 自己的 reconciliation 打架——如果這個
// 非同步流程進行到一半，任何其他 state 更新（例如捲動觸發的
// IntersectionObserver）造成 ViewPage 重新 render，React 會把畫面上的
// img.src 改回它認知中「本來該有的值」（也就是原本的 URL），把我們剛換
// 上去的 blob URL 又蓋回去，導致這張圖在最終輸出時看起來像是「沒抓到」
// ——而且只有時機不巧才會發生，實測起來就是不穩定、有時候某張圖會消失、
// 有時候不會。改在 onclone 拿到的複製文件上操作，這份文件完全獨立於
// React 管理的畫面，不會有這個問題。
//
// 另外兩個各自獨立的原因，這個函式一次處理：
// 1. Tainted canvas：Supabase Storage 的照片是 Cache-Control:
//    max-age=31536000（一年）但沒有 Vary: Origin，瀏覽器對同一個網址的
//    快取不會依 CORS 模式分開兩份，html2canvas-pro 用 CORS 模式重新抓圖
//    時可能沿用「先前非 CORS 模式」快取下來的內容，讓整張 canvas 被標記
//    tainted，之後 toBlob() 匯出時直接被瀏覽器擋下來。fetch() 直接把圖
//    抓成 blob 完全繞開 <img> 標籤自己的載入/快取機制。
// 2. 只在 img.src 換成 blob URL 後等 'load' 事件不夠嚴謹：檔案比較大、
//    解碼比較慢的圖（例如封面照片），html2canvas-pro 有機會搶在瀏覽器
//    真正把 blob URL 解碼完成前就開始畫 canvas。改用 img.decode()——
//    這支瀏覽器 API 明確保證「圖片已經完整解碼、可以直接畫出來」，
//    比單純等 load 事件更嚴格
async function inlineImagesAsBlobUrls(clonedDoc) {
  const images = [...clonedDoc.querySelectorAll('img[src]')].filter((img) => {
    const src = img.getAttribute('src')
    return src && !src.startsWith('data:') && !src.startsWith('blob:')
  })
  const objectUrls = []
  await Promise.all(
    images.map(async (img) => {
      try {
        const res = await fetch(img.src, { mode: 'cors', cache: 'force-cache' })
        if (!res.ok) return
        const blob = await res.blob()
        const objectUrl = URL.createObjectURL(blob)
        objectUrls.push(objectUrl)
        img.src = objectUrl
        await img.decode()
      } catch {
        // 抓不到或解碼失敗就維持原本 src，讓 html2canvas-pro 自己再試一次；
        // 不保證那張圖一定成功，但至少不會讓整個下載流程直接掛掉
      }
    })
  )
  return objectUrls
}

// 真正的根因（tainted canvas）：實測逐一排除圖片、字型、CSS 漸層後發現，
// 是任何套了 filter: drop-shadow(...) 的 SVG（貼紙圖示、留言角標的訪客
// 貼紙）會讓 html2canvas-pro 產生的 canvas 被標記為 tainted，跟圖片/
// CORS/快取完全無關——用最小的合成測試（一個純 inline SVG 套
// drop-shadow，不含任何外部資源）重現一樣的 SecurityError，確認是套件
// 在處理「SVG + CSS filter」這個組合時的渲染路徑問題。
//
// 另一個根因（封面整塊消失）：.cover 這個容器有進場動畫
// （animation: coverEnter，從 opacity:0 動畫到 1），html2canvas-pro 把
// DOM 複製到隱藏 iframe 時，CSS animation 會在複製品裡重新從頭開始播放
// （這是瀏覽器對「新插入 DOM 的動畫元素」的正常行為，不是這個套件特有的
// bug），而 html2canvas-pro 幾乎是複製完就馬上讀取畫面，常常搶在動畫播完
// 前——也就是還在 opacity 接近 0 的那一幀——就把畫面畫進 canvas，導致
// 封面整塊內容（照片、姓名、祝福語）看起來像是不見了，而且因為跟動畫
// 時機有關，才會時好時壞。
//
// 這兩個效果（陰影、進場動畫）拍照當下拿掉都不影響卡片實際內容，用一個
// <style> 蓋掉是目前能讓下載真正、穩定成功的做法
function neutralizeCosmeticEffects(clonedDoc) {
  const style = clonedDoc.createElement('style')
  style.textContent = '* { filter: none !important; animation: none !important; transition: none !important; }'
  clonedDoc.head.appendChild(style)
}

export async function downloadCardAsPng(element, recipientName) {
  if (!element) throw new Error('找不到卡片內容')
  const { default: html2canvas } = await import('html2canvas-pro')
  let createdObjectUrls = []
  const canvas = await html2canvas(element, {
    useCORS: true,
    backgroundColor: '#ffffff',
    scale: Math.min(window.devicePixelRatio || 1, 2),
    onclone: async (clonedDoc) => {
      neutralizeCosmeticEffects(clonedDoc)
      createdObjectUrls = await inlineImagesAsBlobUrls(clonedDoc)
    },
  })
  createdObjectUrls.forEach((u) => URL.revokeObjectURL(u))

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('圖片產生失敗'))), 'image/png')
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `給${sanitizeFilename(recipientName)}的卡片.png`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
