// 貼紙庫：16 個簡約線條貼紙，風格與 BuiltInIllustration / DoodleScatter 一致，
// 能搭配三種質感風格（紙張拼貼／水彩渲染／插畫手繪）不顯突兀
export const STICKER_IDS = [
  'heart',
  'star',
  'ribbon',
  'flower',
  'balloon',
  'handprint',
  'tape',
  'smiley',
  'sparkle',
  'cloud',
  'sun',
  'moon',
  'leaf',
  'gift',
  'thumbsup',
  'confetti',
]

export const STICKER_LABELS = {
  heart: '愛心',
  star: '星星',
  ribbon: '緞帶',
  flower: '花朵',
  balloon: '氣球',
  handprint: '掌印',
  tape: '膠帶',
  smiley: '笑臉',
  sparkle: '閃亮',
  cloud: '雲朵',
  sun: '太陽',
  moon: '月亮',
  leaf: '葉子',
  gift: '禮物',
  thumbsup: '讚',
  confetti: '彩點',
}

export function isValidStickerId(id) {
  return STICKER_IDS.includes(id)
}
