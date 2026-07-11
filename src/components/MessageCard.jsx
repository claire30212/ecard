import { computePhotoLayout, computeLayoutTransform } from '../lib/layout'
import StickerIcon from './StickerIcon'

function formatDate(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

export default function MessageCard({ message, category, style, layoutStyle, isAdmin, onEdit, onDelete, justAdded }) {
  const { tilt, stackOffset } = computeLayoutTransform(layoutStyle, message.layout_seed)
  const photoTransform = message.photo_url
    ? computePhotoLayout(category.photoLayout, message.layout_seed)
    : null

  return (
    <article
      className={`msg-card msg-card--${style.id} ${justAdded ? 'msg-card--enter' : ''}`}
      style={{ '--tilt': `${tilt}deg`, '--stack-offset': `${stackOffset}px` }}
    >
      {style.id === 'paper_collage' && <span className="msg-card__tape" aria-hidden="true" />}

      {message.sticker_id && (
        <span className="msg-card__sticker" aria-hidden="true">
          <StickerIcon stickerId={message.sticker_id} className="msg-card__sticker-icon" />
        </span>
      )}

      {message.photo_url && (
        <div
          className={`msg-card__photo photo--${category.photoLayout} photo--${style.id} ${
            justAdded ? 'msg-card__photo--develop' : ''
          }`}
          style={{
            '--rotate': `${photoTransform.rotate}deg`,
            '--offset-x': `${photoTransform.offsetX}px`,
            '--offset-y': `${photoTransform.offsetY}px`,
          }}
        >
          <img src={message.photo_url} alt={`${message.author_name} 的照片`} loading="lazy" />
        </div>
      )}

      {message.content && <p className="msg-card__content">{message.content}</p>}

      <div className="msg-card__footer">
        <span className="msg-card__author">{message.author_name}</span>
        <span className="msg-card__date">{formatDate(message.updated_at || message.created_at)}</span>
      </div>

      {isAdmin && (
        <div className="msg-card__admin-actions">
          <button type="button" className="btn-chip" onClick={() => onEdit(message)}>
            編輯
          </button>
          <button type="button" className="btn-chip btn-chip--danger" onClick={() => onDelete(message)}>
            刪除
          </button>
        </div>
      )}
    </article>
  )
}
