import MessageCard from './MessageCard'
import EmptyState from './EmptyState'
import DoodleScatter from './DoodleScatter'
import DecorationLayer from './DecorationLayer'

export default function MessageWall({
  messages,
  category,
  style,
  isAdmin,
  recipientName,
  decorations,
  onAddClick,
  onEdit,
  onDelete,
  newlyAddedId,
}) {
  return (
    <section className={`message-wall message-wall--${style.id}`}>
      {style.id === 'illustration' && <DoodleScatter categoryId={category.id} />}
      <DecorationLayer decorations={decorations} zone="wall" />
      <div className="message-wall__inner">
        {messages.length === 0 ? (
          <EmptyState category={category} recipientName={recipientName} />
        ) : (
          <div className="message-wall__grid">
            {messages.map((m) => (
              <MessageCard
                key={m.id}
                message={m}
                category={category}
                style={style}
                isAdmin={isAdmin}
                onEdit={onEdit}
                onDelete={onDelete}
                justAdded={m.id === newlyAddedId}
              />
            ))}
          </div>
        )}
      </div>

      <button type="button" className="fab-add" onClick={onAddClick}>
        新增留言
      </button>
    </section>
  )
}
