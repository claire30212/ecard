import { useState } from 'react'
import Modal from './Modal'
import { uploadPhoto, PhotoUploadError } from '../lib/storage'
import { MAX_CONTENT_LENGTH } from '../lib/constants'

export default function EditMessageModal({ message, cardId, onClose, onSubmitted }) {
  const [content, setContent] = useState(message.content || '')
  const [keepPhoto, setKeepPhoto] = useState(Boolean(message.photo_url))
  const [newPhotoFile, setNewPhotoFile] = useState(null)
  const [newPhotoPreview, setNewPhotoPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setNewPhotoFile(file)
    setNewPhotoPreview(URL.createObjectURL(file))
    setKeepPhoto(true)
  }

  const trimmedContent = content.trim()
  const canSubmit = (trimmedContent || newPhotoFile || (keepPhoto && message.photo_url)) && !submitting

  async function handleSubmit(e) {
    e.preventDefault()
    if (!trimmedContent && !newPhotoFile && !(keepPhoto && message.photo_url)) {
      setError('留言至少要有文字或照片')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      let photoUrl = keepPhoto ? message.photo_url : null
      if (newPhotoFile) photoUrl = await uploadPhoto(newPhotoFile, cardId)
      const ok = await onSubmitted({ content: trimmedContent || null, photoUrl })
      if (!ok) {
        setError('更新失敗，請重新整理頁面後再試')
        setSubmitting(false)
      }
    } catch (err) {
      setError(err instanceof PhotoUploadError ? err.message : '更新失敗，請稍後再試一次')
      setSubmitting(false)
    }
  }

  return (
    <Modal title="編輯留言" onClose={onClose}>
      <form onSubmit={handleSubmit} className="message-form">
        <label className="field">
          <span className="field__label">想說的話</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX_CONTENT_LENGTH}
            rows={4}
            disabled={submitting}
          />
        </label>

        {message.photo_url && keepPhoto && !newPhotoPreview && (
          <div className="message-form__preview">
            <img src={message.photo_url} alt="目前的照片" />
            <button type="button" className="btn-chip" onClick={() => setKeepPhoto(false)} disabled={submitting}>
              移除照片
            </button>
          </div>
        )}

        {newPhotoPreview && (
          <div className="message-form__preview">
            <img src={newPhotoPreview} alt="新照片預覽" />
          </div>
        )}

        <label className="field">
          <span className="field__label">{keepPhoto ? '換一張照片（選填）' : '重新附上照片（選填）'}</span>
          <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={submitting} />
        </label>

        {error && <p className="field__error">{error}</p>}

        <div className="message-form__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={submitting}>
            取消
          </button>
          <button type="submit" className="btn btn--primary" disabled={!canSubmit}>
            {submitting && <span className="btn-spinner" aria-hidden="true" />}
            {submitting ? '儲存中...' : '儲存'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
