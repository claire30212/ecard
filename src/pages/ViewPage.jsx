import { useEffect, useRef, useState } from 'react'
import { fetchCard, verifyAdminKey, fetchMessages, addMessage, editMessage, deleteMessage } from '../lib/cards'
import { getCategory, getStyle } from '../lib/constants'
import { getThemeColors, themeColorsToCssVars } from '../lib/colorThemes'
import Cover from '../components/Cover'
import ScrollHint from '../components/ScrollHint'
import MessageWall from '../components/MessageWall'
import DoodleScatter from '../components/DoodleScatter'
import DecorationLayer from '../components/DecorationLayer'
import MessageForm from '../components/MessageForm'
import EditMessageModal from '../components/EditMessageModal'
import ConfirmDialog from '../components/ConfirmDialog'
import DecorationEditorModal from '../components/DecorationEditorModal'
import EditCardSettingsModal from '../components/EditCardSettingsModal'
import LayoutPickerModal from '../components/LayoutPickerModal'
import FloatingEffect from '../components/FloatingEffect'

export default function ViewPage({ cardId, adminKeyFromUrl }) {
  const [card, setCard] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMessage, setEditingMessage] = useState(null)
  const [deletingMessage, setDeletingMessage] = useState(null)
  const [newlyAddedId, setNewlyAddedId] = useState(null)
  const [banner, setBanner] = useState('')
  const [showDecorationEditor, setShowDecorationEditor] = useState(false)
  const [showCardSettings, setShowCardSettings] = useState(false)
  const [showLayoutPicker, setShowLayoutPicker] = useState(false)
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
          const verified = await verifyAdminKey({ cardId, adminKey: adminKeyFromUrl })
          if (cancelled) return
          if (verified) setIsAdmin(true)
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

  async function handleAddSubmitted({ authorName, content, photoUrl, stickerId }) {
    const row = await addMessage({ cardId, authorName, content, photoUrl, stickerId })
    setMessages((prev) => [...prev, row])
    setNewlyAddedId(row.id)
    setShowAddForm(false)
    setTimeout(() => setNewlyAddedId(null), 1200)
  }

  async function handleEditSubmitted(messageId, { content, photoUrl }) {
    const ok = await editMessage({ messageId, adminKey: adminKeyFromUrl, content, photoUrl })
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
      const ok = await deleteMessage({ messageId: target.id, adminKey: adminKeyFromUrl })
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
  const themeColors = getThemeColors(card.color_theme, card.color_adjust)
  const themeVars = themeColorsToCssVars(themeColors)

  return (
    <div className={`view-page view-page--${category.id}`} style={themeVars}>
      {isAdmin && (
        <div className="admin-banner">
          <span>管理模式：可編輯、刪除留言</span>
          <div className="admin-banner__actions">
            <button type="button" className="btn-chip btn-chip--on-dark" onClick={() => setShowDecorationEditor(true)}>
              裝飾卡片
            </button>
            <button type="button" className="btn-chip btn-chip--on-dark" onClick={() => setShowCardSettings(true)}>
              編輯卡片設定
            </button>
            <button type="button" className="btn-chip btn-chip--on-dark" onClick={() => setShowLayoutPicker(true)}>
              換排列方式
            </button>
          </div>
        </div>
      )}

      <section className={`cover-section cover-section--${style.id}`}>
        <DoodleScatter categoryId={category.id} className={`doodle-scatter--${style.id}`} />
        <DecorationLayer decorations={card.decorations} zone="cover" />
        <FloatingEffect categoryId={category.id} />
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
          layoutStyle={card.layout_style}
          isAdmin={isAdmin}
          recipientName={card.recipient_name}
          decorations={card.decorations}
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

      {showDecorationEditor && (
        <DecorationEditorModal
          card={card}
          adminKey={adminKeyFromUrl}
          onClose={() => setShowDecorationEditor(false)}
          onSaved={(decorations) => {
            setCard((prev) => ({ ...prev, decorations }))
            setShowDecorationEditor(false)
            showBanner('裝飾已儲存')
          }}
        />
      )}

      {showCardSettings && (
        <EditCardSettingsModal
          card={card}
          categoryId={category.id}
          adminKey={adminKeyFromUrl}
          onClose={() => setShowCardSettings(false)}
          onSaved={(updates) => {
            setCard((prev) => ({ ...prev, ...updates }))
            setShowCardSettings(false)
            showBanner('卡片設定已更新')
          }}
        />
      )}

      {showLayoutPicker && (
        <LayoutPickerModal
          card={card}
          adminKey={adminKeyFromUrl}
          onClose={() => setShowLayoutPicker(false)}
          onSaved={(layoutStyle) => {
            setCard((prev) => ({ ...prev, layout_style: layoutStyle }))
            setShowLayoutPicker(false)
            showBanner('排列方式已更新')
          }}
        />
      )}
    </div>
  )
}
