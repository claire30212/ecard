import { useEffect, useRef, useState } from 'react'
import { fetchCard, fetchCardAdminKey, fetchMessages, addMessage, editMessage, deleteMessage } from '../lib/cards'
import { getCategory, getStyle } from '../lib/constants'
import Cover from '../components/Cover'
import ScrollHint from '../components/ScrollHint'
import MessageWall from '../components/MessageWall'
import MessageForm from '../components/MessageForm'
import EditMessageModal from '../components/EditMessageModal'
import ConfirmDialog from '../components/ConfirmDialog'

export default function ViewPage({ cardId, adminKeyFromUrl }) {
  const [card, setCard] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [realAdminKey, setRealAdminKey] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMessage, setEditingMessage] = useState(null)
  const [deletingMessage, setDeletingMessage] = useState(null)
  const [newlyAddedId, setNewlyAddedId] = useState(null)
  const [banner, setBanner] = useState('')
  const wallRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const cardData = await fetchCard(cardId)
        if (cancelled) return
        if (!cardData) {
          setNotFound(true)
          setLoading(false)
          return
        }
        setCard(cardData)

        const msgs = await fetchMessages(cardId)
        if (cancelled) return
        setMessages(msgs)

        if (adminKeyFromUrl) {
          const realKey = await fetchCardAdminKey(cardId)
          if (cancelled) return
          if (realKey && realKey === adminKeyFromUrl) {
            setIsAdmin(true)
            setRealAdminKey(realKey)
          }
        }
      } catch {
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [cardId, adminKeyFromUrl])

  function showBanner(text) {
    setBanner(text)
    setTimeout(() => setBanner(''), 2500)
  }

  async function handleAddSubmitted({ authorName, content, photoUrl }) {
    const row = await addMessage({ cardId, authorName, content, photoUrl })
    setMessages((prev) => [...prev, row])
    setNewlyAddedId(row.id)
    setShowAddForm(false)
    setTimeout(() => setNewlyAddedId(null), 1200)
  }

  async function handleEditSubmitted(messageId, { content, photoUrl }) {
    const ok = await editMessage({ messageId, adminKey: realAdminKey, content, photoUrl })
    if (ok) {
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, content, photo_url: photoUrl, updated_at: new Date().toISOString() } : m)))
      setEditingMessage(null)
    }
    return ok
  }

  async function handleDeleteConfirmed() {
    const target = deletingMessage
    setDeletingMessage(null)
    try {
      const ok = await deleteMessage({ messageId: target.id, adminKey: realAdminKey })
      if (ok) {
        setMessages((prev) => prev.filter((m) => m.id !== target.id))
      } else {
        showBanner('刪除失敗，請重新整理頁面後再試')
      }
    } catch {
      showBanner('刪除失敗，請稍後再試')
    }
  }

  if (loading) return <div className="page-status">載入中...</div>
  if (notFound) return <div className="page-status">找不到這張卡片，請確認連結是否正確</div>

  const category = getCategory(card.category)
  const style = getStyle(card.style)

  return (
    <div className={`view-page view-page--${category.id}`}>
      {isAdmin && <div className="admin-banner">管理模式：可編輯、刪除留言</div>}

      <section className="cover-section">
        <Cover
          category={category}
          style={style}
          recipientName={card.recipient_name}
          coverPhotoUrl={card.cover_photo_url}
          blessingMessage={card.blessing_message}
          showBlessing={card.show_blessing}
          creatorSignature={card.creator_signature}
          showSignature={card.show_signature}
        />
        <ScrollHint onClick={() => wallRef.current?.scrollIntoView({ behavior: 'smooth' })} />
      </section>

      <div ref={wallRef}>
        <MessageWall
          messages={messages}
          category={category}
          style={style}
          isAdmin={isAdmin}
          recipientName={card.recipient_name}
          onAddClick={() => setShowAddForm(true)}
          onEdit={setEditingMessage}
          onDelete={setDeletingMessage}
          newlyAddedId={newlyAddedId}
        />
      </div>

      {banner && <div className="toast-banner">{banner}</div>}

      {showAddForm && (
        <MessageForm cardId={cardId} onClose={() => setShowAddForm(false)} onSubmitted={handleAddSubmitted} />
      )}

      {editingMessage && (
        <EditMessageModal
          message={editingMessage}
          cardId={cardId}
          onClose={() => setEditingMessage(null)}
          onSubmitted={(payload) => handleEditSubmitted(editingMessage.id, payload)}
        />
      )}

      {deletingMessage && (
        <ConfirmDialog
          title="刪除留言"
          message={`確定要刪除 ${deletingMessage.author_name} 的留言嗎？刪除後無法復原。`}
          confirmLabel="刪除"
          danger
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setDeletingMessage(null)}
        />
      )}
    </div>
  )
}
