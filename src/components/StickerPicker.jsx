import { useState } from 'react'
import StickerIcon from './StickerIcon'
import { STICKER_CATEGORIES, STICKER_LABELS } from '../lib/stickers'

export default function StickerPicker({ selectedId, onSelect, allowClear = true }) {
  const [activeCategory, setActiveCategory] = useState(STICKER_CATEGORIES[0].id)
  const category = STICKER_CATEGORIES.find((c) => c.id === activeCategory) || STICKER_CATEGORIES[0]

  return (
    <div className="sticker-picker">
      {allowClear && (
        <button
          type="button"
          className={`sticker-picker__clear ${!selectedId ? 'sticker-picker__clear--selected' : ''}`}
          onClick={() => onSelect(null)}
        >
          不加貼紙
        </button>
      )}

      <div className="sticker-picker__tabs" role="tablist">
        {STICKER_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={c.id === activeCategory}
            className={`sticker-picker__tab ${c.id === activeCategory ? 'sticker-picker__tab--active' : ''}`}
            onClick={() => setActiveCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="sticker-picker__grid">
        {category.ids.map((id) => (
          <button
            key={id}
            type="button"
            className={`sticker-picker__item ${selectedId === id ? 'sticker-picker__item--selected' : ''}`}
            onClick={() => onSelect(id)}
            aria-label={STICKER_LABELS[id]}
            title={STICKER_LABELS[id]}
          >
            <StickerIcon stickerId={id} className="sticker-picker__icon" />
          </button>
        ))}
      </div>
    </div>
  )
}
