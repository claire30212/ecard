import { useState } from 'react'
import Modal from './Modal'
import BuiltInIllustration from './BuiltInIllustration'
import { STYLES, ILLUSTRATION_VARIANTS, makeIllustrationRef, parseIllustrationRef, MAX_NAME_LENGTH, MAX_CONTENT_LENGTH } from '../lib/constants'
import { COLOR_THEMES } from '../lib/colorThemes'
import { editCardSettings } from '../lib/cards'
import { uploadPhoto, PhotoUploadError } from '../lib/storage'

function initialCoverMode(coverPhotoUrl) {
  if (!coverPhotoUrl) return 'none'
  return parseIllustrationRef(coverPhotoUrl) ? 'illustration' : 'upload'
}

export default function EditCardSettingsModal({ card, categoryId, adminKey, onClose, onSaved }) {
  const [style, setStyle] = useState(card.style)
  const [coverMode, setCoverMode] = useState(initialCoverMode(card.cover_photo_url))
  const [coverPhotoFile, setCoverPhotoFile] = useState(null)
  const [coverPhotoPreview, setCoverPhotoPreview] = useState(
    initialCoverMode(card.cover_photo_url) === 'upload' ? card.cover_photo_url : null
  )
  const illustrationRef = parseIllustrationRef(card.cover_photo_url)
  const [illustrationVariant, setIllustrationVariant] = useState(illustrationRef?.variant || '1')
  const [blessingMessage, setBlessingMessage] = useState(card.blessing_message || '')
  const [showBlessing, setShowBlessing] = useState(card.show_blessing)
  const [creatorSignature, setCreatorSignature] = useState(card.creator_signature || '')
  const [showSignature, setShowSignature] = useState(card.show_signature)
  const [colorTheme, setColorTheme] = useState(card.color_theme || 'warm')
  const [colorAdjust, setColorAdjust] = useState(card.color_adjust || 0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function handleCoverFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverPhotoFile(file)
    setCoverPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      let coverPhotoUrl = null
      if (coverMode === 'upload') {
        coverPhotoUrl = coverPhotoFile ? await uploadPhoto(coverPhotoFile, card.id) : card.cover_photo_url
      } else if (coverMode === 'illustration') {
        coverPhotoUrl = makeIllustrationRef(categoryId, illustrationVariant)
      }

      const ok = await editCardSettings({
        cardId: card.id,
        adminKey,
        style,
        coverPhotoUrl,
        blessingMessage: blessingMessage.trim() || null,
        showBlessing,
        creatorSignature: creatorSignature.trim() || null,
        showSignature,
        colorTheme,
        colorAdjust,
        decorations: card.decorations || [],
        layoutStyle: card.layout_style,
      })

      if (ok) {
        onSaved({
          style,
          cover_photo_url: coverPhotoUrl,
          blessing_message: blessingMessage.trim() || null,
          show_blessing: showBlessing,
          creator_signature: creatorSignature.trim() || null,
          show_signature: showSignature,
          color_theme: colorTheme,
          color_adjust: colorAdjust,
        })
      } else {
        setError('儲存失敗，請重新整理頁面後再試')
      }
    } catch (err) {
      setError(err instanceof PhotoUploadError ? err.message : '儲存失敗，請稍後再試一次')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="編輯卡片設定" onClose={onClose}>
      <form onSubmit={handleSubmit} className="message-form">
        <div className="field">
          <span className="field__label">質感風格</span>
          <div className="style-grid style-grid--compact">
            {STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`style-card style-card--${s.id} ${style === s.id ? 'style-card--selected' : ''}`}
                onClick={() => setStyle(s.id)}
              >
                <span className="style-card__label">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <label className="field">
          <span className="field__label field__label--with-toggle">
            祝福語
            <span className="toggle">
              <input type="checkbox" checked={showBlessing} onChange={(e) => setShowBlessing(e.target.checked)} />
              顯示於封面
            </span>
          </span>
          <textarea
            value={blessingMessage}
            onChange={(e) => setBlessingMessage(e.target.value)}
            maxLength={MAX_CONTENT_LENGTH}
            rows={2}
            disabled={submitting}
          />
        </label>

        <label className="field">
          <span className="field__label field__label--with-toggle">
            建立者署名
            <span className="toggle">
              <input type="checkbox" checked={showSignature} onChange={(e) => setShowSignature(e.target.checked)} />
              顯示於封面
            </span>
          </span>
          <input
            type="text"
            value={creatorSignature}
            onChange={(e) => setCreatorSignature(e.target.value)}
            maxLength={MAX_NAME_LENGTH}
            disabled={submitting}
          />
        </label>

        <div className="field">
          <span className="field__label">封面主視覺</span>
          <div className="cover-mode-tabs">
            <button type="button" className={`btn-chip ${coverMode === 'none' ? 'btn-chip--active' : ''}`} onClick={() => setCoverMode('none')}>
              不使用照片
            </button>
            <button type="button" className={`btn-chip ${coverMode === 'upload' ? 'btn-chip--active' : ''}`} onClick={() => setCoverMode('upload')}>
              上傳照片
            </button>
            <button type="button" className={`btn-chip ${coverMode === 'illustration' ? 'btn-chip--active' : ''}`} onClick={() => setCoverMode('illustration')}>
              內建插畫
            </button>
          </div>

          {coverMode === 'upload' && (
            <div className="cover-mode-panel">
              <input type="file" accept="image/*" onChange={handleCoverFileChange} disabled={submitting} />
              {coverPhotoPreview && (
                <div className="message-form__preview">
                  <img src={coverPhotoPreview} alt="封面預覽" />
                </div>
              )}
            </div>
          )}

          {coverMode === 'illustration' && (
            <div className="illustration-picker">
              {(ILLUSTRATION_VARIANTS[categoryId] || []).map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`illustration-option ${illustrationVariant === v ? 'illustration-option--selected' : ''}`}
                  onClick={() => setIllustrationVariant(v)}
                >
                  <BuiltInIllustration categoryId={categoryId} variant={v} className="illustration-option__icon" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="field">
          <span className="field__label">底色</span>
          <div className="theme-picker">
            {COLOR_THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`theme-swatch ${colorTheme === t.id ? 'theme-swatch--selected' : ''}`}
                style={{ '--swatch-main': t.main, '--swatch-sub': t.sub, '--swatch-accent': t.accent }}
                onClick={() => setColorTheme(t.id)}
              >
                <span className="theme-swatch__dots" aria-hidden="true">
                  <span className="theme-swatch__dot" />
                  <span className="theme-swatch__dot" />
                  <span className="theme-swatch__dot" />
                </span>
                <span className="theme-swatch__label">{t.label}</span>
              </button>
            ))}
          </div>
          <label className="theme-adjust">
            <span className="field__label">明暗微調</span>
            <input
              type="range"
              min="-20"
              max="20"
              value={colorAdjust}
              onChange={(e) => setColorAdjust(Number(e.target.value))}
            />
          </label>
        </div>

        {error && <p className="field__error">{error}</p>}

        <div className="message-form__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={submitting}>
            取消
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting && <span className="btn-spinner" aria-hidden="true" />}
            {submitting ? '儲存中...' : '儲存'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
