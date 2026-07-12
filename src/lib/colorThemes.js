// 4 組預設色系，取代原本「依類別強制決定顏色」的做法。
// 使用者建立卡片時可以自由更換色系，並在同一色系內用 color_adjust 微調明暗
export const COLOR_THEMES = [
  {
    id: 'warm',
    label: '溫馨系',
    hint: '長輩、溫暖祝福',
    main: '#F5F0EB',
    sub: '#E8B4A0',
    accent: '#C9A97E',
    ink: '#5C4A3A',
  },
  {
    id: 'fresh',
    label: '清爽系',
    hint: '年輕人、清新風格',
    main: '#B8C4CC',
    sub: '#A8B5A2',
    accent: '#F5F0EB',
    ink: '#3E463C',
  },
  {
    id: 'calm',
    label: '沉穩系',
    hint: '男性、正式場合',
    main: '#D9CFC1',
    sub: '#8B6F5C',
    accent: '#B8926A',
    ink: '#4A3B2E',
  },
  {
    id: 'playful',
    label: '童趣系',
    hint: '小孩、活潑可愛',
    main: '#F5F0EB',
    sub: '#F0C9B8',
    accent: '#BFDCE0',
    ink: '#4A3B45',
  },
]

// 類別 → 建議色系（僅作為精靈預設值，使用者可自由更換，不強制綁定）
export const CATEGORY_DEFAULT_THEME = {
  birthday: 'warm',
  anniversary: 'calm',
  blessing: 'fresh',
  thanks: 'warm',
}

export function getColorTheme(themeId) {
  return COLOR_THEMES.find((t) => t.id === themeId) || COLOR_THEMES[0]
}

function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  const d = max - min
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case r:
        h = ((g - b) / d) % 6
        break
      case g:
        h = (b - r) / d + 2
        break
      default:
        h = (r - g) / d + 4
    }
    h *= 60
    if (h < 0) h += 360
  }
  return [h, s * 100, l * 100]
}

function hslToHex(h, s, l) {
  s /= 100
  l /= 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0
  let g = 0
  let b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const toHex = (v) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// 明暗微調：在色系原本明度基礎上加減，clamp 在 0~100，避免調過頭失去對比
export function adjustLightness(hex, deltaPercent) {
  const [h, s, l] = hexToHsl(hex)
  const newL = Math.min(100, Math.max(0, l + (deltaPercent || 0)))
  return hslToHex(h, s, newL)
}

function relativeLuminance(hex) {
  const toLinear = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const [r, g, b] = [1, 3, 5].map((i) => toLinear(parseInt(hex.slice(i, i + 2), 16) / 255))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(hexA, hexB) {
  const [l1, l2] = [relativeLuminance(hexA), relativeLuminance(hexB)].sort((a, b) => b - a)
  return (l1 + 0.05) / (l2 + 0.05)
}

// R9/R10 都「修過」祝福類別按鈕看起來像沒反應，但兩次都只在文字色/邊框
// 補救，沒解決根本問題：fresh 色系的 accent 明度高達 94%（其他三組色系
// 是 57~64%），這已經不是「文字對比不足」，而是這個顏色本身就是接近
// 白色，不管疊什麼顏色的文字、加多細的邊框，整塊底色看起來就是「幾乎
// 沒有顏色」。真正的修法是「用在實心填滿的按鈕/圓點這種需要明顯呈現
// 『有顏色、可點擊』的地方時，不要直接用原始 accent」，而是把明度夾在
// 一個上限之內（同色相、飽和度不變，只壓低明度），讓四組色系的按鈕底色
// 明度都落在同一個範圍內，视觉上都是「明顯的一塊顏色」，不會有某一組
// 特別淡。上限抓 65%，大約是 warm 系 accent 原本的明度（64.1%），
// 意即 warm/calm 這兩組本來就過關的色系維持原樣不變。
const SOLID_FILL_MAX_LIGHTNESS = 65

function vividAccent(hex) {
  const [h, s, l] = hexToHsl(hex)
  const cappedL = Math.min(l, SOLID_FILL_MAX_LIGHTNESS)
  return hslToHex(h, s, cappedL)
}

// 算出卡片實際要用的一組顏色。ink 刻意不隨 adjust 變動，避免文字對比不足
export function getThemeColors(themeId, adjust = 0) {
  const theme = getColorTheme(themeId)
  const accent = adjustLightness(theme.accent, adjust)
  const accentSolid = vividAccent(accent)
  // 「疊在 accentSolid 底色上的文字」該用白色還是 ink 深色，取決於這組
  // 顏色實際算出來多亮
  const onAccent = contrastRatio('#ffffff', accentSolid) >= 2 ? '#ffffff' : theme.ink
  return {
    main: adjustLightness(theme.main, adjust),
    sub: adjustLightness(theme.sub, adjust),
    accent,
    accentSolid,
    ink: theme.ink,
    onAccent,
  }
}

export function themeColorsToCssVars(colors) {
  return {
    '--main': colors.main,
    '--sub': colors.sub,
    '--accent': colors.accent,
    '--accent-solid': colors.accentSolid,
    '--ink': colors.ink,
    '--on-accent': colors.onAccent || '#fff',
  }
}
