import { useRef } from 'react'
import MessageCard from './MessageCard'
import EmptyState from './EmptyState'
import DoodleScatter from './DoodleScatter'
import DecorationLayer from './DecorationLayer'

function MessageGrid({ messages, category, style, layoutStyle, isAdmin, onEdit, onDelete, newlyAddedId, gridClassName }) {
  return (
    <div className={gridClassName}>
      {messages.map((m) => (
        <MessageCard
          key={m.id}
          message={m}
          category={category}
          style={style}
          layoutStyle={layoutStyle}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
          justAdded={m.id === newlyAddedId}
        />
      ))}
    </div>
  )
}

export default function MessageWall({
  messages,
  category,
  style,
  layoutStyle = 'collage',
  isAdmin,
  recipientName,
  decorations,
  decorationMode,
  wallSectionRef,
  onAddClick,
  onEdit,
  onDelete,
  newlyAddedId,
}) {
  const gridClassName = `message-wall__grid message-wall__grid--${layoutStyle === 'grouped' ? 'loose' : layoutStyle}`
  const localRef = useRef(null)

  return (
    <section className={`message-wall message-wall--${style.id}`} ref={wallSectionRef || localRef}>
      {style.id === 'illustration' && <DoodleScatter categoryId={category.id} />}
      {!decorationMode && <DecorationLayer decorations={decorations} zone="wall" />}
      <div className="message-wall__inner">
        {messages.length === 0 ? (
          <EmptyState category={category} recipientName={recipientName} />
        ) : layoutStyle === 'grouped' ? (
          <>
            {messages.filter((m) => m.photo_url).length > 0 && (
              <div className="message-wall__group">
                <h3 className="message-wall__group-heading">附照片的祝福</h3>
                <MessageGrid
                  messages={messages.filter((m) => m.photo_url)}
                  category={category}
                  style={style}
                  layoutStyle={layoutStyle}
                  isAdmin={isAdmin}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  newlyAddedId={newlyAddedId}
                  gridClassName={gridClassName}
                />
              </div>
            )}
            {messages.filter((m) => !m.photo_url).length > 0 && (
              <div className="message-wall__group">
                <h3 className="message-wall__group-heading">文字祝福</h3>
                <MessageGrid
                  messages={messages.filter((m) => !m.photo_url)}
                  category={category}
                  style={style}
                  layoutStyle={layoutStyle}
                  isAdmin={isAdmin}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  newlyAddedId={newlyAddedId}
                  gridClassName={gridClassName}
                />
              </div>
            )}
          </>
        ) : (
          <MessageGrid
            messages={messages}
            category={category}
            style={style}
            layoutStyle={layoutStyle}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={onDelete}
            newlyAddedId={newlyAddedId}
            gridClassName={gridClassName}
          />
        )}
      </div>

      {!decorationMode && (
        <button type="button" className="fab-add" onClick={onAddClick}>
          新增留言
        </button>
      )}
    </section>
  )
}
