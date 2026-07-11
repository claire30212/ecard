import { useEffect, useRef, useState } from 'react'
import { fetchCard, verifyAdminKey, fetchMessages, addMessage, editMessage, deleteMessage, editCardSettings } from '../lib/cards'
import { getCategory, getStyle } from '../lib/constants'
import { getThemeColors, themeColorsToCssVars } from '../lib/colorThemes'
import { isTapeSticker } from '../lib/stickers'
import Cover from '../components/Cover'
import ScrollHint from '../components/ScrollHint'
import MessageWall from '../components/MessageWall'
import DoodleScatter from '../components/DoodleScatter'
import DecorationLayer from '../components/DecorationLayer'
import InteractiveDecorationLayer from '../components/InteractiveDecorationLayer'
import StickerPicker from '../components/StickerPicker'
import MessageForm from '../components/MessageForm'
import EditMessageModal from '../components/EditMessageModal'
import ConfirmDialog from '../components/ConfirmDialog'
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
  const [decorationMode, setDecorationMode] = useState(false)
  const [showCardSettings, setShowCardSettings] = useState(false)
  const [showLayoutPicker, setShowLayoutPicker] = useState(false)
  const wallRef = useRef(null)
  const coverSectionRef = useRef(null)
  const wallSectionRef = useRef(null)

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

  function updateDecorations(updater) {
    setCard((prev) => ({
      ...prev,
      decorations: typeof updater === 'function' ? updater(prev.decorations || []) : updater,
    }))
  }

  // 依目前使用者捲動位置比較靠近封面還是留言牆背景，決定新貼紙要落在哪個
  // zone，並用該區塊目前可視範圍的垂直中心點算出預設位置，讓貼紙「先出現在
  // 使用者當下的可視範圍內」
  function pickZoneAndPosition() {
    const viewportCenter = window.innerHeight / 2
    const coverRect = coverSectionRef.current?.getBoundingClientRect()
    const wallRect = wallSectionRef.current?.getBoundingClientRect()

    function positionWithin(rect) {
      const y = ((viewportCenter - rect.top) / rect.height) * 100
      return Math.min(95, Math.max(5, y))
    }

    if (coverRect && coverRect.top <= viewportCenter && coverRect.bottom >= viewportCenter) {
      return { zone: 'cover', x: 50, y: positionWithin(coverRect) }
    }
    if (wallRect && wallRect.top <= viewportCenter && wallRect.bottom >= viewportCenter) {
      return { zone: 'wall', x: 50, y: positionWithin(wallRect) }
    }
    if (coverRect && wallRect) {
      const coverDist = Math.abs((coverRect.top + coverRect.bottom) / 2 - viewportCenter)
      const wallDist = Math.abs((wallRect.top + wallRect.bottom) / 2 - viewportCenter)
      return coverDist <= wallDist ? { zone: 'cover', x: 50, y: 50 } : { zone: 'wall', x: 50, y: 50 }
    }
    return { zone: 'cover', x: 50, y: 50 }
  }

  function addSticker(stickerId) {
    if (!stickerId) return
    const { zone, x, y } = pickZoneAndPosition()
    const rotation = isTapeSticker(stickerId) ? Math.round((Math.random() * 24 - 12) * 10) / 10 : 0
    updateDecorations((prev) => [...prev, { sticker_id: stickerId, zone, x_percent: x, y_percent: y, rotation, scale: 1 }])
  }

  async function handleFinishDecorating() {
    setDecorationMode(false)
    try {
      const ok = await editCardSettings({
        cardId: card.id,
        adminKey: adminKeyFromUrl,
        style: card.style,
        coverPhotoUrl: card.cover_photo_url,
        blessingMessage: card.blessing_message,
        showBlessing: card.show_blessing,
        creatorSignature: card.creator_signature,
        showSignature: card.show_signature,
        colorTheme: card.color_theme,
        colorAdjust: card.color_adjust,
        decorations: card.decorations || [],
        layoutStyle: card.layout_style,
      })
      showBanner(ok ? '裝飾已儲存' : '儲存失敗，請重新整理頁面後再試')
    } catch {
      showBanner('儲存失敗，請稍後再試')
    }
  }

  async function handleAddSubmitted({ authorName, content, photoUrl, stickerId, stickerColor }) {
    const row = await addMessage({ cardId, authorName, content, photoUrl, stickerId, stickerColor })
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
            <button
              type="button"
              className="btn-chip btn-chip--on-dark"
              onClick={() => (decorationMode ? handleFinishDecorating() : setDecorationMode(true))}
            >
              {decorationMode ? '完成裝飾' : '裝飾卡片'}
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

      <section className={`cover-section cover-section--${style.id}`} ref={coverSectionRef}>
        <DoodleScatter categoryId={category.id} className={`doodle-scatter--${style.id}`} />
        {decorationMode ? (
          <InteractiveDecorationLayer decorations={card.decorations} zone="cover" onChange={updateDecorations} />
        ) : (
          <DecorationLayer decorations={card.decorations} zone="cover" />
        )}
        {!decorationMode && <FloatingEffect categoryId={category.id} />}
        <Cover
          category={category}
          style={style}
          recipientName={card.recipient_name}
          coverPhotoUrl={card.cover_photo_url}
          blessingMessage={card.blessing_message}
          showBlessing={card.show_blessing}
          creatorSignature={card.creator_signature}
          showSignature={card.show_signature}
          decorationMode={decorationMode}
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
          decorationMode={decorationMode}
          onDecorationsChange={updateDecorations}
          wallSectionRef={wallSectionRef}
          onAddClick={() => setShowAddForm(true)}
          onEdit={setEditingMessage}
          onDelete={setDeletingMessage}
          newlyAddedId={newlyAddedId}
        />
      </div>

      {decorationMode && (
        <div className="decoration-palette">
          <p className="decoration-palette__hint">點選貼紙後拖曳到想要的位置，捲動頁面可裝飾封面或留言牆背景</p>
          <StickerPicker allowClear={false} onSelect={addSticker} />
        </div>
      )}

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
