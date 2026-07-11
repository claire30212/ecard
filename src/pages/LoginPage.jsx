import { useState } from 'react'
import { signInWithMagicLink } from '../lib/auth'

export default function LoginPage({ title = '登入帳號', subtitle = '建立卡片前，先留下你的 Email' }) {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) {
      setError('請輸入 Email')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await signInWithMagicLink(trimmed)
      setSent(true)
    } catch {
      setError('寄送失敗，請確認 Email 是否正確後再試一次')
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="login-page">
        <h2 className="wizard-step__heading">請 check 信箱點擊連結登入</h2>
        <p className="login-page__hint">我們已經寄一封信到 {email}，點裡面的連結就能完成登入。</p>
      </div>
    )
  }

  return (
    <div className="login-page">
      <h2 className="wizard-step__heading">{title}</h2>
      <p className="login-page__hint">{subtitle}</p>
      <form onSubmit={handleSubmit} className="login-page__form">
        <label className="field">
          <span className="field__label">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={submitting}
            autoFocus
          />
        </label>
        {error && <p className="field__error">{error}</p>}
        <div className="wizard-step__actions">
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting && <span className="btn-spinner" aria-hidden="true" />}
            {submitting ? '寄送中...' : '寄送登入連結'}
          </button>
        </div>
      </form>
    </div>
  )
}
