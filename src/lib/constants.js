export const CATEGORIES = [
  {
    id: 'birthday',
    label: '生日',
    colors: { main: '#F5F0EB', sub: '#E8B4A0', accent: '#C9A97E', ink: '#5C4A3A' },
    photoLayout: 'polaroid',
    greeting: '生日快樂',
  },
  {
    id: 'anniversary',
    label: '紀念日',
    colors: { main: '#D4B5A8', sub: '#9BAEBE', accent: '#B08B85', ink: '#4A3B38' },
    photoLayout: 'scatter',
    greeting: '紀念此刻',
  },
  {
    id: 'blessing',
    label: '祝福',
    // accent 原本是 #B8C4CC（淺灰藍），疊在 main #A8B5A2 上當小花插畫圖示
    // 顏色時對比度只有 1.21（其他三個類別的圖示對比度都在 1.6~3 之間），
    // 看起來太淡、不清楚。改成同色相但明度壓低的深藍，對比度提升到 3.13，
    // 跟其他類別圖示的清晰度一致
    colors: { main: '#A8B5A2', sub: '#F5F0EB', accent: '#36607D', ink: '#3E463C' },
    photoLayout: 'scatter',
    greeting: '獻上祝福',
  },
  {
    id: 'thanks',
    label: '感謝',
    colors: { main: '#D9CFC1', sub: '#B8926A', accent: '#8B6F5C', ink: '#4A3B2E' },
    photoLayout: 'polaroid',
    greeting: '謝謝有你',
  },
]

export const STYLES = [
  {
    id: 'paper_collage',
    label: '紙張拼貼風',
    description: '淡淡紙紋背景，便利貼與膠帶裝飾，方形白邊相框',
  },
  {
    id: 'watercolor',
    label: '水彩渲染風',
    description: '柔邊漸層色塊，暈染邊緣，照片邊緣柔邊消融',
    disabledTouch: false,
  },
  {
    id: 'illustration',
    label: '插畫手繪風',
    description: '手繪線條裝飾，手繪畫框留言卡與照片外框',
  },
]

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0]
}

export function getStyle(id) {
  return STYLES.find((s) => s.id === id) || STYLES[0]
}

// 系統內建插畫底圖以自訂協定字串存於 cover_photo_url（資料表結構固定，無額外欄位）
export const ILLUSTRATION_PREFIX = 'illustration:'

export function makeIllustrationRef(categoryId, variant) {
  return `${ILLUSTRATION_PREFIX}${categoryId}:${variant}`
}

export function parseIllustrationRef(value) {
  if (!value || !value.startsWith(ILLUSTRATION_PREFIX)) return null
  const rest = value.slice(ILLUSTRATION_PREFIX.length)
  const [categoryId, variant] = rest.split(':')
  return { categoryId, variant: variant || '1' }
}

export const ILLUSTRATION_VARIANTS = {
  birthday: ['1', '2', '3', '4', '5'],
  anniversary: ['1', '2', '3', '4', '5'],
  blessing: ['1', '2', '3', '4', '5'],
  thanks: ['1', '2', '3', '4', '5'],
}

export const MAX_CONTENT_LENGTH = 300
export const MAX_NAME_LENGTH = 20
