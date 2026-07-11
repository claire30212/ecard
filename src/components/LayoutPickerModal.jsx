import { useState } from 'react'
import Modal from './Modal'
import { LAYOUT_STYLES } from '../lib/layoutStyles'
import { editCardSettings } from '../lib/cards'

// 選定即立即套用並關閉，不需要額外「儲存」按鈕，操作上更接近「換一種試試看」
export default function LayoutPickerModal({ card, adminKey, onClose, onSaved }) {
  const [applyingId, setApplyingId] = useState(null)
  const [error, setError] = useState('')

  async function handlePick(layoutStyle) {
    if (applyingId) return
    setApplyingId(layoutStyle)
    setError('')
    try {
      const ok = await editCardSettings({
        cardId: card.id,
        adminKey,
        style: card.style,
        coverPhotoUrl: card.cover_photo_url,
        blessingMessage: card.blessing_message,
        showBlessing: card.show_blessing,
        creatorSignature: card.creator_signature,
        showSignature: card.show_signature,
        colorTheme: card.color_theme,
        colorAdjust: card.color_adjust,
        decorations: card.decorations || [],
        layoutStyle,
      })
      if (ok) {
        onSaved(layoutStyle)
      } else {
        setError('套用失敗，請重新整理頁面後再試')
        setApplyingId(null)
      }
    } catch {
      setError('套用失敗，請稍後再試一次')
      setApplyingId(null)
    }
  }

  return (
    <Modal title="換排列方式" onClose={onClose}>
      <div className="style-grid">
        {LAYOUT_STYLES.map((l) => (
          <button
            key={l.id}
            type="button"
            className={`style-card ${card.layout_style === l.id ? 'style-card--selected' : ''}`}
            onClick={() => handlePick(l.id)}
            disabled={Boolean(applyingId)}
          >
            <span className="style-card__label">
              {l.label}
              {applyingId === l.id && <span className="btn-spinner" aria-hidden="true" />}
            </span>
            <span className="style-card__desc">{l.description}</span>
          </button>
        ))}
      </div>
      {error && <p className="field__error">{error}</p>}
    </Modal>
  )
}
