export const LAYOUT_STYLES = [
  {
    id: 'collage',
    label: '緊密拼貼版',
    description: '卡片間距縮小、輕微重疊，密度感較高',
  },
  {
    id: 'loose',
    label: '鬆散錯落版',
    description: '間距加大、重疊減少，較為疏朗好閱讀',
  },
  {
    id: 'timeline',
    label: '依時間整齊排列',
    description: '依留言時間先後排成規律網格，清爽簡潔',
  },
  {
    id: 'grouped',
    label: '依有無照片分區',
    description: '有照片的留言與純文字留言分開群組呈現',
  },
]

export function getLayoutStyle(id) {
  return LAYOUT_STYLES.find((l) => l.id === id) || LAYOUT_STYLES[0]
}
