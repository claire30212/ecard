import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchMyCards } from '../lib/cards'
import { signOut } from '../lib/auth'
import { buildCardLink } from '../lib/links'
import { copyText } from '../lib/clipboard'
import { getCategory, getStyle } from '../lib/constants'
import LoginPage from './LoginPage'

function formatDate(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

function CardRow({ card }) {
  const [copied, setCopied] = useState(false)
  const category = getCategory(card.category)
  const style = getStyle(card.style)

  async function handleCopyGuestLink() {
    const ok = await copyText(buildCardLink(card.id))
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <li className="my-cards__row">
      <div className="my-cards__row-main">
        <span className="my-cards__row-name">給 {card.recipient_name}</span>
        <span className="my-cards__row-meta">
          {category.label} · {style.label} · {formatDate(card.created_at)} · {card.messageCount} 則留言
        </span>
      </div>
      <div className="my-cards__row-actions">
        <a className="btn-chip" href={buildCardLink(card.id, card.admin_key)}>
          查看
        </a>
        <button type="button" className="btn-chip" onClick={handleCopyGuestLink}>
          {copied ? '已複製' : '複製訪客連結'}
        </button>
      </div>
    </li>
  )
}

export default function MyCardsPage() {
  const { user, loading: authLoading } = useAuth()
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoading(true)
    fetchMyCards()
      .then((data) => {
        if (!cancelled) setCards(data)
      })
      .catch(() => {
        if (!cancelled) setError('卡片列表載入失敗，請重新整理頁面')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  if (authLoading) {
    return <div className="page-status">載入中...</div>
  }

  if (!user) {
    return (
      <div className="create-page">
        <LoginPage title="登入查看我的卡片" subtitle="用 Email 收一封登入連結，不需要密碼" />
      </div>
    )
  }

  return (
    <div className="create-page my-cards">
      <header className="create-page__header">
        <h1 className="create-page__title">我的卡片</h1>
        <p className="create-page__subtitle">{user.email}</p>
      </header>

      <div className="my-cards__toolbar">
        <a className="btn btn--primary" href={`${window.location.origin}${import.meta.env.BASE_URL}`}>
          建立新卡片
        </a>
        <button type="button" className="btn btn--ghost" onClick={() => signOut()}>
          登出
        </button>
      </div>

      {loading && <div className="page-status">載入中...</div>}
      {error && <p className="field__error">{error}</p>}

      {!loading && !error && cards.length === 0 && (
        <p className="login-page__hint">還沒有建立過卡片，回首頁開始做第一張吧。</p>
      )}

      {!loading && cards.length > 0 && (
        <ul className="my-cards__list">
          {cards.map((card) => (
            <CardRow key={card.id} card={card} />
          ))}
        </ul>
      )}
    </div>
  )
}
