// 貼紙庫：三種風格分類，風格與 BuiltInIllustration / DoodleScatter 一致，
// 能搭配三種質感風格（紙張拼貼／水彩渲染／插畫手繪）不顯突兀
export const STICKER_CATEGORIES = [
  {
    id: 'line',
    label: '簡約',
    ids: [
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
    ],
  },
  {
    id: 'illustration',
    label: '插畫',
    ids: [
      'cat',
      'dog',
      'bear',
      'bunny',
      'cloud_face',
      'sun_face',
      'flower_cute',
      'rainbow',
      'cake',
    ],
  },
  {
    id: 'tape',
    label: '膠帶',
    ids: [
      'tape_plain',
      'tape_stripe',
      'tape_dot',
      'tape_grid',
      'tape_zigzag',
      'tape_scallop',
      'tape_stitch',
      'tape_arrow',
    ],
  },
]

export const STICKER_IDS = STICKER_CATEGORIES.flatMap((c) => c.ids)

export const STICKER_LABELS = {
  heart: '愛心',
  star: '星星',
  ribbon: '緞帶',
  flower: '花朵',
  balloon: '氣球',
  handprint: '掌印',
  tape: '膠帶線條',
  smiley: '笑臉',
  sparkle: '閃亮',
  cloud: '雲朵',
  sun: '太陽',
  moon: '月亮',
  leaf: '葉子',
  gift: '禮物',
  thumbsup: '讚',
  confetti: '彩點',
  cat: '貓咪',
  dog: '小狗',
  bear: '小熊',
  bunny: '兔兔',
  cloud_face: '雲朵笑臉',
  sun_face: '太陽笑臉',
  flower_cute: '可愛小花',
  rainbow: '彩虹',
  cake: '蛋糕',
  tape_plain: '素色膠帶',
  tape_stripe: '條紋膠帶',
  tape_dot: '圓點膠帶',
  tape_grid: '格紋膠帶',
  tape_zigzag: '鋸齒邊膠帶',
  tape_scallop: '波浪邊膠帶',
  tape_stitch: '縫線膠帶',
  tape_arrow: '箭頭膠帶',
}

const TAPE_STICKER_IDS = STICKER_CATEGORIES.find((c) => c.id === 'tape').ids

export function isValidStickerId(id) {
  return STICKER_IDS.includes(id)
}

export function isTapeSticker(id) {
  return TAPE_STICKER_IDS.includes(id)
}
