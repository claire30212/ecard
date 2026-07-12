// 下載卡片存檔（PNG），只在收件人專屬連結顯示。動態載入截圖套件，
// 避免所有訪客都要多載入這個套件的體積，只有真的點下載才載入。
// 用 html2canvas-pro 而不是原始 html2canvas：專案 CSS 大量使用
// color-mix()（R9/R10 為了對比度修的一批按鈕/選取狀態），原始 html2canvas
// 的顏色解析器不認得這個較新的 CSS 函式，整頁只要有一處 color-mix() 就會
// 直接拋錯、整張截圖失敗；html2canvas-pro 是專門修過這塊的維護分支
function sanitizeFilename(name) {
  return (name || '卡片').replace(/[<>:"/\\|?*]/g, '')
}

export async function downloadCardAsPng(element, recipientName) {
  if (!element) throw new Error('找不到卡片內容')
  const { default: html2canvas } = await import('html2canvas-pro')
  const canvas = await html2canvas(element, {
    useCORS: true,
    backgroundColor: '#ffffff',
    scale: Math.min(window.devicePixelRatio || 1, 2),
  })

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
