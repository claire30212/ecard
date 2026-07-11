import StickerIcon from './StickerIcon'
import { STICKER_IDS, STICKER_LABELS } from '../lib/stickers'

export default function StickerPicker({ selectedId, onSelect, allowClear = true }) {
  return (
    <div className="sticker-picker">
      {allowClear && (
        <button
          type="button"
          className={`sticker-picker__item ${!selectedId ? 'sticker-picker__item--selected' : ''}`}
          onClick={() => onSelect(null)}
          aria-label="不加貼紙"
        >
          <span className="sticker-picker__none">無</span>
        </button>
      )}
      {STICKER_IDS.map((id) => (
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
  )
}
