import { useRef } from 'react'
import StickerIcon from './StickerIcon'

// 所見即所得的裝飾層：跟唯讀 DecorationLayer 用同一套「相對容器的百分比座標」
// 定位邏輯，差別是這裡的貼紙可以直接拖曳，拖曳當下就即時呼叫 onChange 更新
// 真實的 card.decorations，畫面立刻反映（沒有另外的模擬預覽/儲存步驟）。
// 這個元件本身是 position:absolute; inset:0，自己的 bounding rect 就等於
// 所在容器（.cover-section 或 .message-wall）的內容區域，不用額外從外面傳
// 容器 ref 進來。
export default function InteractiveDecorationLayer({ decorations, zone, onChange }) {
  const layerRef = useRef(null)
  const dragIndexRef = useRef(null)

  const items = (decorations || []).map((d, i) => ({ ...d, _index: i })).filter((d) => d.zone === zone)

  function handlePointerDown(e, index) {
    dragIndexRef.current = index
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e) {
    const index = dragIndexRef.current
    if (index === null || !layerRef.current) return
    const rect = layerRef.current.getBoundingClientRect()
    let xPercent = ((e.clientX - rect.left) / rect.width) * 100
    let yPercent = ((e.clientY - rect.top) / rect.height) * 100
    xPercent = Math.min(100, Math.max(0, xPercent))
    yPercent = Math.min(100, Math.max(0, yPercent))
    onChange((prev) => prev.map((d, i) => (i === index ? { ...d, x_percent: xPercent, y_percent: yPercent } : d)))
  }

  function handlePointerUp() {
    dragIndexRef.current = null
  }

  function removeAt(index) {
    onChange((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="decoration-layer decoration-layer--interactive" ref={layerRef} aria-hidden="true">
      {items.map((item) => (
        <div
          key={item._index}
          className="decoration-layer__item decoration-layer__item--draggable"
          style={{
            left: `${item.x_percent}%`,
            top: `${item.y_percent}%`,
            transform: `translate(-50%, -50%) rotate(${item.rotation || 0}deg) scale(${item.scale || 1})`,
          }}
          onPointerDown={(e) => handlePointerDown(e, item._index)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <StickerIcon stickerId={item.sticker_id} className="decoration-layer__icon" />
          <button
            type="button"
            className="decoration-layer__remove"
            onClick={(e) => {
              e.stopPropagation()
              removeAt(item._index)
            }}
            aria-label="移除貼紙"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
