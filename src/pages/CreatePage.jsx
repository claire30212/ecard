import { useState } from 'react'
import { CATEGORIES, STYLES, ILLUSTRATION_VARIANTS, makeIllustrationRef, MAX_NAME_LENGTH, MAX_CONTENT_LENGTH } from '../lib/constants'
import { COLOR_THEMES, CATEGORY_DEFAULT_THEME, getThemeColors, themeColorsToCssVars } from '../lib/colorThemes'
import { createCard } from '../lib/cards'
import { uploadPhoto, PhotoUploadError } from '../lib/storage'
import { buildCardLink, buildMyCardsLink } from '../lib/links'
import { useAuth } from '../context/AuthContext'
import BuiltInIllustration from '../components/BuiltInIllustration'
import CopyField from '../components/CopyField'
import LoginPage from './LoginPage'

const STEP_TITLES = ['選擇類別', '選擇風格', '設定封面', '完成']

export default function CreatePage({ onViewCard }) {
  const { user, loading: authLoading } = useAuth()
  const [step, setStep] = useState(1)
  const [categoryId, setCategoryId] = useState(null)
  const [styleId, setStyleId] = useState(null)
  const [recipientName, setRecipientName] = useState('')
  const [blessingMessage, setBlessingMessage] = useState('')
  const [showBlessing, setShowBlessing] = useState(true)
  const [creatorSignature, setCreatorSignature] = useState('')
  const [showSignature, setShowSignature] = useState(true)
  const [coverMode, setCoverMode] = useState('none') // 'none' | 'upload' | 'illustration'
  const [coverPhotoFile, setCoverPhotoFile] = useState(null)
  const [coverPhotoPreview, setCoverPhotoPreview] = useState(null)
  const [illustrationVariant, setIllustrationVariant] = useState('1')
  const [colorTheme, setColorTheme] = useState('warm')
  const [colorAdjust, setColorAdjust] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  function handleCategorySelect(id) {
    setCategoryId(id)
    setColorTheme(CATEGORY_DEFAULT_THEME[id] || 'warm')
    setColorAdjust(0)
  }

  const themeVars = themeColorsToCssVars(getThemeColors(colorTheme, colorAdjust))

  function handleCoverFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverPhotoFile(file)
    setCoverPhotoPreview(URL.createObjectURL(file))
    setCoverMode('upload')
  }

  async function handleCreate() {
    const trimmedName = recipientName.trim()
    if (!trimmedName) {
      setError('請填寫收件人姓名')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const cardId = crypto.randomUUID()
      let coverPhotoUrl = null
      if (coverMode === 'upload' && coverPhotoFile) {
        coverPhotoUrl = await uploadPhoto(coverPhotoFile, cardId)
      } else if (coverMode === 'illustration') {
        coverPhotoUrl = makeIllustrationRef(categoryId, illustrationVariant)
      }

      const { admin_key } = await createCard({
        id: cardId,
        creator_id: user.id,
        category: categoryId,
        style: styleId,
        recipient_name: trimmedName,
        cover_photo_url: coverPhotoUrl,
        blessing_message: blessingMessage.trim() || null,
        show_blessing: showBlessing,
        creator_signature: creatorSignature.trim() || null,
        show_signature: showSignature,
        color_theme: colorTheme,
        color_adjust: colorAdjust,
        decorations: [],
        layout_style: 'collage',
      })

      setResult({ id: cardId, adminKey: admin_key })
      setStep(4)
    } catch (err) {
      setError(err instanceof PhotoUploadError ? err.message : '建立卡片失敗，請確認網路連線後再試一次')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return <div className="page-status">載入中...</div>
  }

  return (
    <div className={`create-page ${categoryId ? `create-page--${categoryId}` : ''}`} style={themeVars}>
      <header className="create-page__header">
        <h1 className="create-page__title">手作電子卡片</h1>
        <p className="create-page__subtitle">為重要的人，做一張可以一起留言的卡片</p>
        {user && (
          <a className="create-page__mycards-link" href={buildMyCardsLink()}>
            我的卡片
          </a>
        )}
        {user && (
          <div className="step-dots">
            {STEP_TITLES.map((t, i) => (
              <span key={t} className={`step-dot ${step === i + 1 ? 'step-dot--active' : ''} ${step > i + 1 ? 'step-dot--done' : ''}`}>
                {i + 1}
              </span>
            ))}
          </div>
        )}
      </header>

      {!user && (
        <LoginPage title="建立卡片前，先登入" subtitle="輸入 Email 與密碼登入，還沒有帳號可以直接切換到「註冊」" />
      )}

      {user && step === 1 && (
        <section className="wizard-step">
          <h2 className="wizard-step__heading">這張卡片是什麼類別？</h2>
          <div className="category-grid">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`category-card ${categoryId === c.id ? 'category-card--selected' : ''}`}
                style={{ '--card-main': c.colors.main, '--card-accent': c.colors.accent }}
                onClick={() => handleCategorySelect(c.id)}
              >
                <BuiltInIllustration categoryId={c.id} variant="1" className="category-card__icon" />
                <span>{c.label}</span>
              </button>
            ))}
          </div>
          <div className="wizard-step__actions">
            <button type="button" className="btn btn--primary" disabled={!categoryId} onClick={() => setStep(2)}>
              下一步
            </button>
          </div>
        </section>
      )}

      {user && step === 2 && (
        <section className="wizard-step">
          <h2 className="wizard-step__heading">想要什麼質感風格？</h2>
          <div className="style-grid">
            {STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`style-card style-card--${s.id} ${styleId === s.id ? 'style-card--selected' : ''}`}
                onClick={() => setStyleId(s.id)}
              >
                <span className="style-card__label">{s.label}</span>
                <span className="style-card__desc">{s.description}</span>
              </button>
            ))}
          </div>
          <div className="wizard-step__actions">
            <button type="button" className="btn btn--ghost" onClick={() => setStep(1)}>
              上一步
            </button>
            <button type="button" className="btn btn--primary" disabled={!styleId} onClick={() => setStep(3)}>
              下一步
            </button>
          </div>
        </section>
      )}

      {user && step === 3 && (
        <section className="wizard-step">
          <h2 className="wizard-step__heading">設定封面</h2>

          <label className="field">
            <span className="field__label">收件人姓名（必填）</span>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              maxLength={MAX_NAME_LENGTH}
              placeholder="例如：小美"
            />
          </label>

          <label className="field">
            <span className="field__label field__label--with-toggle">
              祝福語（選填）
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
              placeholder="想對他說的話"
            />
          </label>

          <label className="field">
            <span className="field__label field__label--with-toggle">
              建立者署名（選填）
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
              placeholder="你的名字"
            />
          </label>

          <div className="field">
            <span className="field__label">封面主視覺（選填，可留空以手寫姓名為主視覺）</span>
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
                <input type="file" accept="image/*" onChange={handleCoverFileChange} />
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
            <span className="field__label">底色（選填，預設依類別建議一組，可自由更換）</span>
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
                  <span className="theme-swatch__hint">{t.hint}</span>
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

          <div className="wizard-step__actions">
            <button type="button" className="btn btn--ghost" onClick={() => setStep(2)} disabled={submitting}>
              上一步
            </button>
            <button type="button" className="btn btn--primary" onClick={handleCreate} disabled={submitting}>
              {submitting && <span className="btn-spinner" aria-hidden="true" />}
              {submitting ? '建立中...' : '產生卡片連結'}
            </button>
          </div>
        </section>
      )}

      {user && step === 4 && result && (
        <section className="wizard-step">
          <h2 className="wizard-step__heading">卡片建立完成</h2>
          <p className="login-page__hint">這張卡片已經自動加進「我的卡片」列表，不用特地記連結。</p>
          <CopyField
            label="訪客連結"
            hint="這組連結可以分享給親友，讓大家留言"
            value={buildCardLink(result.id)}
            tone="guest"
          />
          <CopyField
            label="管理連結"
            hint="這組連結請自己保存，不要外流；可用來編輯或刪除留言"
            value={buildCardLink(result.id, result.adminKey)}
            tone="admin"
          />
          <div className="wizard-step__actions">
            <button type="button" className="btn btn--primary" onClick={() => onViewCard(result.id, result.adminKey)}>
              前往查看卡片
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
