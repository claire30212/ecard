const MAX_EDGE = 1200
const QUALITY = 0.8
// 部分瀏覽器對不支援的照片格式（例如手機拍的 HEIC）既不會觸發 onload 也不會觸發
// onerror，畫面會卡在「送出中」卻永遠不會結束，使用者感覺像完全沒反應。
// 加上逾時保護，確保一定會 resolve 或 reject，不會無限卡住。
const LOAD_TIMEOUT_MS = 15000

// 前端壓縮：長邊縮至 1200px 內，統一輸出 JPEG 品質 0.8，減少 Storage 用量與載入時間
export function compressImage(file) {
  if (!file.type || !file.type.startsWith('image/')) {
    return Promise.reject(new Error('這個檔案看起來不是照片格式，請重新選擇一張照片'))
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    let settled = false

    const timeoutId = setTimeout(() => {
      if (settled) return
      settled = true
      URL.revokeObjectURL(url)
      reject(new Error('這張照片的格式可能不支援（例如 iPhone 的 HEIC），請換一張 JPG 或 PNG 試試看'))
    }, LOAD_TIMEOUT_MS)

    img.onload = () => {
      if (settled) return
      settled = true
      clearTimeout(timeoutId)
      let { width, height } = img
      if (width > MAX_EDGE || height > MAX_EDGE) {
        if (width >= height) {
          height = Math.round((height * MAX_EDGE) / width)
          width = MAX_EDGE
        } else {
          width = Math.round((width * MAX_EDGE) / height)
          height = MAX_EDGE
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          if (!blob) reject(new Error('圖片壓縮失敗'))
          else resolve(blob)
        },
        'image/jpeg',
        QUALITY
      )
    }
    img.onerror = () => {
      if (settled) return
      settled = true
      clearTimeout(timeoutId)
      URL.revokeObjectURL(url)
      reject(new Error('這張照片無法讀取，請換一張試試看'))
    }
    img.src = url
  })
}
