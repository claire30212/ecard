const MAX_EDGE = 1200
const QUALITY = 0.8

// 前端壓縮：長邊縮至 1200px 內，統一輸出 JPEG 品質 0.8，減少 Storage 用量與載入時間
export function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
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
      URL.revokeObjectURL(url)
      reject(new Error('圖片讀取失敗'))
    }
    img.src = url
  })
}
