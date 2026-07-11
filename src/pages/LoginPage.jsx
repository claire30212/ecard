import { useState } from 'react'
import { signInWithPassword, signUpWithPassword } from '../lib/auth'

const MIN_PASSWORD_LENGTH = 6

export default function LoginPage({ title = '登入帳號', subtitle = '建立卡片前，先登入你的帳號' }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmNotice, setConfirmNotice] = useState(false)

  function switchMode(next) {
    setMode(next)
    setError('')
    setPassword('')
    setConfirmPassword('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('請輸入 Email')
      return
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`密碼至少需要 ${MIN_PASSWORD_LENGTH} 碼`)
      return
    }
    if (mode === 'register' && password !== confirmPassword) {
      setError('兩次輸入的密碼不一致')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      if (mode === 'register') {
        const { needsEmailConfirm } = await signUpWithPassword(trimmedEmail, password)
        if (needsEmailConfirm) {
          setConfirmNotice(true)
        }
        // needsEmailConfirm 為 false 時，signUp 已直接建立 session，
        // AuthContext 的 onAuthStateChange 會自動更新畫面，不用額外處理
      } else {
        await signInWithPassword(trimmedEmail, password)
      }
    } catch (err) {
      if (mode === 'register') {
        setError(err.message?.includes('already registered') ? '這個 Email 已經註冊過了，請改用登入' : '註冊失敗，請確認資料後再試一次')
      } else {
        setError('登入失敗，請確認 Email 與密碼是否正確')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmNotice) {
    return (
      <div className="login-page">
        <h2 className="wizard-step__heading">請 check 信箱完成驗證</h2>
        <p className="login-page__hint">我們已經寄一封驗證信到 {email}，點裡面的連結完成驗證後，就可以用剛剛設定的密碼登入了。</p>
      </div>
    )
  }

  return (
    <div className="login-page">
      <h2 className="wizard-step__heading">{mode === 'login' ? title : '註冊新帳號'}</h2>
      <p className="login-page__hint">{mode === 'login' ? subtitle : '設定 Email 與密碼，之後就用這組資料登入'}</p>

      <div className="login-page__tabs">
        <button type="button" className={`btn-chip ${mode === 'login' ? 'btn-chip--active' : ''}`} onClick={() => switchMode('login')}>
          登入
        </button>
        <button type="button" className={`btn-chip ${mode === 'register' ? 'btn-chip--active' : ''}`} onClick={() => switchMode('register')}>
          註冊
        </button>
      </div>

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

        <label className="field">
          <span className="field__label">密碼</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="至少 6 碼"
            disabled={submitting}
            minLength={MIN_PASSWORD_LENGTH}
          />
        </label>

        {mode === 'register' && (
          <label className="field">
            <span className="field__label">確認密碼</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再輸入一次密碼"
              disabled={submitting}
              minLength={MIN_PASSWORD_LENGTH}
            />
          </label>
        )}

        {error && <p className="field__error">{error}</p>}

        <div className="wizard-step__actions">
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting && <span className="btn-spinner" aria-hidden="true" />}
            {submitting ? (mode === 'login' ? '登入中...' : '註冊中...') : mode === 'login' ? '登入' : '註冊'}
          </button>
        </div>
      </form>
    </div>
  )
}
