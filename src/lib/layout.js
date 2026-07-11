// 以 layout_seed（0~1 浮點數）產生固定但看似隨機的排列參數，
// 確保同一則留言每次載入畫面時排列位置一致
function mulberry32(seed) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seededRandoms(seed, count) {
  const rand = mulberry32(Math.floor((seed || 0) * 1e9) >>> 0)
  const values = []
  for (let i = 0; i < count; i++) values.push(rand())
  return values
}

// 生日、感謝 → 拍立得排列：白色相框、隨機小角度傾斜（±3~8 度）
// 紀念日、祝福 → 隨機散落拼貼：輕微重疊、不規則角度與位置
export function computePhotoLayout(photoLayout, layoutSeed) {
  const [r1, r2, r3] = seededRandoms(layoutSeed, 3)
  if (photoLayout === 'polaroid') {
    const sign = r1 < 0.5 ? -1 : 1
    const magnitude = 3 + r2 * 5
    return { rotate: sign * magnitude, offsetX: 0, offsetY: 0 }
  }
  const rotate = (r1 * 2 - 1) * 12
  const offsetX = (r2 * 2 - 1) * 10
  const offsetY = (r3 * 2 - 1) * 8
  return { rotate, offsetX, offsetY }
}

// 留言卡片本身也帶手作感的傾斜，範圍擴大到 -6~6 度，避免拼貼牆過於整齊死板
export function computeCardTilt(layoutSeed) {
  const [r1] = seededRandoms((layoutSeed || 0) + 0.37, 1)
  return (r1 * 2 - 1) * 6
}

// 桌機/平板拼貼牆用的固定垂直位移，讓卡片堆疊有貼滿一面牆的密度感
// （手機寬度不使用，維持單欄可讀性）
export function computeStackOffset(layoutSeed) {
  const [r1] = seededRandoms((layoutSeed || 0) + 0.71, 1)
  return (r1 * 2 - 1) * 16
}
