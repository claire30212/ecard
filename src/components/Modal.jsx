export default function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-box__header">
          <h2>{title}</h2>
          <button type="button" className="modal-box__close" onClick={onClose} aria-label="關閉">
            ×
          </button>
        </div>
        <div className="modal-box__body">{children}</div>
      </div>
    </div>
  )
}
