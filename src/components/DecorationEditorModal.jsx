import { useRef, useState } from 'react'
import Modal from './Modal'
import StickerPicker from './StickerPicker'
import StickerIcon from './StickerIcon'
import { editCardSettings } from '../lib/cards'

const ZONES = [
  { id: 'cover', label: '封面' },
  { id: 'wall', label: '留言牆背景' },
]

// 貼紙位置一律存「相對畫布的百分比座標」（x_percent/y_percent），
// 不用絕對像素，這樣手機/平板/桌機三種版面寬度下貼紙位置才會一致，
// 不會跑位或疊到內容上
export default function DecorationEditorModal({ card, adminKey, onClose, onSaved }) {
  const [decorations, setDecorations] = useState(card.decorations || [])
  const [zone, setZone] = useState('cover')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const canvasRef = useRef(null)
  const dragIndexRef = useRef(null)

  const visibleItems = decorations.map((d, i) => ({ ...d, _index: i })).filter((d) => d.zone === zone)

  function addSticker(stickerId) {
    if (!stickerId) return
    setDecorations((prev) => [
      ...prev,
      { sticker_id: stickerId, zone, x_percent: 50, y_percent: 50, rotation: 0, scale: 1 },
    ])
  }

  function removeAt(index) {
    setDecorations((prev) => prev.filter((_, i) => i !== index))
  }

  function handlePointerDown(e, index) {
    dragIndexRef.current = index
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e) {
    const index = dragIndexRef.current
    if (index === null || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    let xPercent = ((e.clientX - rect.left) / rect.width) * 100
    let yPercent = ((e.clientY - rect.top) / rect.height) * 100
    xPercent = Math.min(100, Math.max(0, xPercent))
    yPercent = Math.min(100, Math.max(0, yPercent))
    setDecorations((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], x_percent: xPercent, y_percent: yPercent }
      return next
    })
  }

  function handlePointerUp() {
    dragIndexRef.current = null
  }

  async function handleSave() {
    setSubmitting(true)
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
        decorations,
      })
      if (ok) {
        onSaved(decorations)
      } else {
        setError('儲存失敗，請重新整理頁面後再試')
      }
    } catch {
      setError('儲存失敗，請稍後再試一次')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="裝飾卡片" onClose={onClose}>
      <div className="decoration-editor">
        <div className="login-page__tabs">
          {ZONES.map((z) => (
            <button
              key={z.id}
              type="button"
              className={`btn-chip ${zone === z.id ? 'btn-chip--active' : ''}`}
              onClick={() => setZone(z.id)}
            >
              {z.label}
            </button>
          ))}
        </div>

        <div className="decoration-canvas" ref={canvasRef}>
          <p className="decoration-canvas__hint">點選下方貼紙加入，拖曳調整位置</p>
          {visibleItems.map((item) => (
            <div
              key={item._index}
              className="decoration-canvas__item"
              style={{
                left: `${item.x_percent}%`,
                top: `${item.y_percent}%`,
                transform: `translate(-50%, -50%) rotate(${item.rotation || 0}deg) scale(${item.scale || 1})`,
              }}
              onPointerDown={(e) => handlePointerDown(e, item._index)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <StickerIcon stickerId={item.sticker_id} className="decoration-canvas__icon" />
              <button
                type="button"
                className="decoration-canvas__remove"
                onClick={(e) => {
                  e.stopPropagation()
                  removeAt(item._index)
                }}
                aria-label="移除貼紙"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <StickerPicker allowClear={false} onSelect={addSticker} />

        {error && <p className="field__error">{error}</p>}

        <div className="message-form__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={submitting}>
            取消
          </button>
          <button type="button" className="btn btn--primary" onClick={handleSave} disabled={submitting}>
            {submitting && <span className="btn-spinner" aria-hidden="true" />}
            {submitting ? '儲存中...' : '儲存'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
