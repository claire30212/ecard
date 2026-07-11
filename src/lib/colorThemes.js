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

// 算出卡片實際要用的一組顏色。ink 刻意不隨 adjust 變動，避免文字對比不足
export function getThemeColors(themeId, adjust = 0) {
  const theme = getColorTheme(themeId)
  return {
    main: adjustLightness(theme.main, adjust),
    sub: adjustLightness(theme.sub, adjust),
    accent: adjustLightness(theme.accent, adjust),
    ink: theme.ink,
  }
}

export function themeColorsToCssVars(colors) {
  return {
    '--main': colors.main,
    '--sub': colors.sub,
    '--accent': colors.accent,
    '--ink': colors.ink,
  }
}
