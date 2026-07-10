import { useState } from 'react'
import Modal from './Modal'
import { uploadPhoto } from '../lib/storage'
import { MAX_CONTENT_LENGTH, MAX_NAME_LENGTH } from '../lib/constants'

export default function MessageForm({ cardId, onClose, onSubmitted }) {
  const [authorName, setAuthorName] = useState('')
  const [content, setContent] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const trimmedName = authorName.trim()
  const trimmedContent = content.trim()
  const canSubmit = trimmedName && (trimmedContent || photoFile) && !submitting

  async function handleSubmit(e) {
    e.preventDefault()
    if (!trimmedName) {
      setError('請填寫你的姓名')
      return
    }
    if (!trimmedContent && !photoFile) {
      setError('請留下一句話或一張照片')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      let photoUrl = null
      if (photoFile) photoUrl = await uploadPhoto(photoFile, cardId)
      await onSubmitted({ authorName: trimmedName, content: trimmedContent || null, photoUrl })
    } catch {
      setError('送出失敗，請稍後再試一次')
      setSubmitting(false)
    }
  }

  return (
    <Modal title="留下祝福" onClose={onClose}>
      <form onSubmit={handleSubmit} className="message-form">
        <label className="field">
          <span className="field__label">你的名字</span>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={MAX_NAME_LENGTH}
            placeholder="怎麼稱呼你呢？"
            disabled={submitting}
          />
        </label>

        <label className="field">
          <span className="field__label">想說的話</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX_CONTENT_LENGTH}
            rows={4}
            placeholder="寫下你的祝福..."
            disabled={submitting}
          />
        </label>

        <label className="field">
          <span className="field__label">附上照片（選填）</span>
          <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={submitting} />
        </label>

        {photoPreview && (
          <div className="message-form__preview">
            <img src={photoPreview} alt="預覽" />
          </div>
        )}

        {error && <p className="field__error">{error}</p>}

        <div className="message-form__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={submitting}>
            取消
          </button>
          <button type="submit" className="btn btn--primary" disabled={!canSubmit}>
            {submitting ? '送出中...' : '送出祝福'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
