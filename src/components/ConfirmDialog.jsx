import Modal from './Modal'

export default function ConfirmDialog({ title, message, confirmLabel = '確定', onConfirm, onCancel, danger }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="confirm-dialog__message">{message}</p>
      <div className="message-form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          取消
        </button>
        <button type="button" className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
