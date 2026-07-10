import { useState } from 'react'
import { copyText } from '../lib/clipboard'

export default function CopyField({ label, hint, value, tone }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const ok = await copyText(value)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className={`copy-field copy-field--${tone}`}>
      <div className="copy-field__label">{label}</div>
      {hint && <div className="copy-field__hint">{hint}</div>}
      <div className="copy-field__row">
        <input type="text" readOnly value={value} onFocus={(e) => e.target.select()} />
        <button type="button" className="btn btn--small" onClick={handleCopy}>
          {copied ? '已複製' : '複製'}
        </button>
      </div>
    </div>
  )
}
