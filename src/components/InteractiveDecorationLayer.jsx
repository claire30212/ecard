import { useEffect, useReducer, useRef } from 'react'
import StickerIcon from './StickerIcon'

const MIN_SCALE = 0.5
const MAX_SCALE = 2.5
const MIN_OPACITY = 0.3
const MAX_OPACITY = 1

// 所見即所得的裝飾層：掛在 .view-page 這一層（涵蓋封面＋留言牆全部內容），
// 而不是各自掛在 .cover-section / .message-wall 底下。R8 之前的版本是「每個
// zone 各自一個獨立元件，拖曳時的座標換算只看自己所在容器的 rect」，因此
// 貼紙一旦被判定成 zone:'cover'，不管使用者怎麼往下拖，y 都會被夾在
// cover-section 自己的高度上限（100%），永遠拖不進留言牆——這正是 R8
// 回報「捲到留言卡片範圍就完全無法貼放」的成因：不是貼紙進不去，而是
// 「先被歸類到封面 zone 的貼紙」被鎖死在封面容器邊界，出不去。
// 這裡改成單一整頁疊層，拖曳時即時判斷游標目前落在封面還是留言牆範圍內，
// 動態改寫該筆貼紙的 zone + 該 zone 內的相對百分比，讓拖曳可以連續跨越
// 封面／留言牆邊界；儲存格式（zone + x_percent/y_percent 皆相對該 zone
// 容器）維持 v4 規格書定義的結構不變，唯讀渲染（DecorationLayer）不用改。
export default function InteractiveDecorationLayer({ decorations, coverSectionRef, wallSectionRef, pageRef, onChange, defaultColor }) {
  const dragIndexRef = useRef(null)
  const resizeStateRef = useRef(null)
  const rotateStateRef = useRef(null)
  const [, forceRerender] = useReducer((n) => n + 1, 0)

  const items = (decorations || []).map((d, i) => ({ ...d, _index: i }))

  // 封面／留言牆隨留言數量、圖片載入完成而變化高度時，強制重新算一次貼紙的
  // 畫面位置，避免疊層停留在舊的（過短）高度快照上
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(() => forceRerender())
    if (coverSectionRef.current) observer.observe(coverSectionRef.current)
    if (wallSectionRef.current) observer.observe(wallSectionRef.current)
    return () => observer.disconnect()
  }, [coverSectionRef, wallSectionRef])

  function getSectionRect(zone) {
    const ref = zone === 'wall' ? wallSectionRef : coverSectionRef
    return ref.current?.getBoundingClientRect() || null
  }

  // 把貼紙「zone + zone 內百分比」換算成相對整個疊層（.view-page 全頁）的
  // 百分比座標，才能用同一個 position:absolute 容器同時畫出封面跟留言牆的貼紙
  function itemPagePercent(item) {
    const sectionRect = getSectionRect(item.zone)
    const pageRect = pageRef.current?.getBoundingClientRect()
    if (!sectionRect || !pageRect || pageRect.width === 0 || pageRect.height === 0) {
      return { left: 50, top: 50 }
    }
    const pxX = sectionRect.left - pageRect.left + (item.x_percent / 100) * sectionRect.width
    const pxY = sectionRect.top - pageRect.top + (item.y_percent / 100) * sectionRect.height
    return {
      left: (pxX / pageRect.width) * 100,
      top: (pxY / pageRect.height) * 100,
    }
  }

  // 依游標目前的畫面座標，判斷該落在封面還是留言牆 zone，並算出「相對該
  // zone 容器」的百分比。游標剛好落在兩個區塊之間（例如捲動過場的空白）時，
  // 以距離較近的區塊為準，讓拖曳感覺是連續的，不會卡住
  function resolveZoneAndPercent(clientX, clientY) {
    const coverRect = coverSectionRef.current?.getBoundingClientRect()
    const wallRect = wallSectionRef.current?.getBoundingClientRect()
    let zone = null
    let rect = null
    if (coverRect && clientY >= coverRect.top && clientY < coverRect.bottom) {
      zone = 'cover'
      rect = coverRect
    } else if (wallRect && clientY >= wallRect.top && clientY <= wallRect.bottom) {
      zone = 'wall'
      rect = wallRect
    } else if (coverRect && wallRect) {
      if (clientY < coverRect.top) {
        zone = 'cover'
        rect = coverRect
      } else if (clientY > wallRect.bottom) {
        zone = 'wall'
        rect = wallRect
      } else {
        const coverDist = Math.abs(clientY - coverRect.bottom)
        const wallDist = Math.abs(clientY - wallRect.top)
        zone = coverDist <= wallDist ? 'cover' : 'wall'
        rect = zone === 'cover' ? coverRect : wallRect
      }
    } else {
      rect = coverRect || wallRect
      zone = coverRect ? 'cover' : 'wall'
    }
    if (!rect) return null
    const xPercent = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    const yPercent = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100))
    return { zone, xPercent, yPercent }
  }

  function handlePointerDown(e, index) {
    dragIndexRef.current = index
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // 部分瀏覽器在特定情境下（如觸控裝置多指觸發）pointerId 可能已失效，
      // 拖曳仍可用一般的 pointermove 事件繼續運作，capture 失敗不影響功能
    }
  }

  function handlePointerMove(e) {
    const index = dragIndexRef.current
    if (index === null) return
    const result = resolveZoneAndPercent(e.clientX, e.clientY)
    if (!result) return
    onChange((prev) =>
      prev.map((d, i) => (i === index ? { ...d, zone: result.zone, x_percent: result.xPercent, y_percent: result.yPercent } : d))
    )
  }

  function handlePointerUp() {
    dragIndexRef.current = null
  }

  function handleResizePointerDown(e, item) {
    e.stopPropagation()
    const rect = getSectionRect(item.zone)
    if (!rect) return
    const centerX = rect.left + (item.x_percent / 100) * rect.width
    const centerY = rect.top + (item.y_percent / 100) * rect.height
    resizeStateRef.current = {
      index: item._index,
      centerX,
      centerY,
      startDist: Math.max(1, Math.hypot(e.clientX - centerX, e.clientY - centerY)),
      startScale: item.scale || 1,
    }
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // 同上，capture 失敗不影響縮放手把功能
    }
  }

  function handleResizePointerMove(e) {
    const state = resizeStateRef.current
    if (!state) return
    const dist = Math.hypot(e.clientX - state.centerX, e.clientY - state.centerY)
    let scale = state.startScale * (dist / state.startDist)
    scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))
    onChange((prev) => prev.map((d, i) => (i === state.index ? { ...d, scale } : d)))
  }

  function handleResizePointerUp() {
    resizeStateRef.current = null
  }

  // 旋轉手把：貼紙上方伸出的小圓點，拖曳時依「游標相對貼紙中心角度的變化量」
  // 換算旋轉角度（相對量，不是絕對角度），避免手指沒有精準抓在圓點正中心時
  // 一移動就跳一下角度；跟縮放手把各自獨立的 ref（resizeStateRef／
  // rotateStateRef），兩者拖曳互不干擾
  function handleRotatePointerDown(e, item) {
    e.stopPropagation()
    const rect = getSectionRect(item.zone)
    if (!rect) return
    const centerX = rect.left + (item.x_percent / 100) * rect.width
    const centerY = rect.top + (item.y_percent / 100) * rect.height
    rotateStateRef.current = {
      index: item._index,
      centerX,
      centerY,
      startAngle: (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) / Math.PI,
      startRotation: item.rotation || 0,
    }
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // 同上，capture 失敗不影響旋轉手把功能
    }
  }

  function handleRotatePointerMove(e) {
    const state = rotateStateRef.current
    if (!state) return
    const currentAngle = (Math.atan2(e.clientY - state.centerY, e.clientX - state.centerX) * 180) / Math.PI
    let deg = state.startRotation + (currentAngle - state.startAngle)
    deg = ((deg + 180) % 360 + 360) % 360 - 180
    onChange((prev) => prev.map((d, i) => (i === state.index ? { ...d, rotation: deg } : d)))
  }

  function handleRotatePointerUp() {
    rotateStateRef.current = null
  }

  function removeAt(index) {
    onChange((prev) => prev.filter((_, i) => i !== index))
  }

  function setColorAt(index, color) {
    onChange((prev) => prev.map((d, i) => (i === index ? { ...d, color } : d)))
  }

  function setOpacityAt(index, opacity) {
    onChange((prev) => prev.map((d, i) => (i === index ? { ...d, opacity } : d)))
  }

  return (
    <div className="decoration-layer decoration-layer--interactive" aria-hidden="true">
      {items.map((item) => {
        const pos = itemPagePercent(item)
        const scale = item.scale || 1
        return (
          <div
            key={item._index}
            className="decoration-layer__item decoration-layer__item--draggable"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              transform: `translate(-50%, -50%) rotate(${item.rotation || 0}deg) scale(${scale})`,
            }}
            onPointerDown={(e) => handlePointerDown(e, item._index)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <StickerIcon
              stickerId={item.sticker_id}
              color={item.color || defaultColor}
              opacity={item.opacity}
              className="decoration-layer__icon"
            />
            <input
              type="color"
              className="decoration-layer__color-swatch"
              value={item.color || defaultColor || '#5c4a3a'}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setColorAt(item._index, e.target.value)}
              aria-label="選擇貼紙顏色"
            />
            <button
              type="button"
              className="decoration-layer__remove"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                removeAt(item._index)
              }}
              aria-label="移除貼紙"
            >
              ×
            </button>
            <button
              type="button"
              className="decoration-layer__resize"
              style={{ transform: `scale(${1 / scale})` }}
              onPointerDown={(e) => handleResizePointerDown(e, item)}
              onPointerMove={handleResizePointerMove}
              onPointerUp={handleResizePointerUp}
              aria-label="拖曳調整貼紙大小"
            />
            <button
              type="button"
              className="decoration-layer__rotate"
              style={{ transform: `translateX(-50%) scale(${1 / scale})` }}
              onPointerDown={(e) => handleRotatePointerDown(e, item)}
              onPointerMove={handleRotatePointerMove}
              onPointerUp={handleRotatePointerUp}
              aria-label="拖曳調整貼紙角度"
            />
            <input
              type="range"
              className="decoration-layer__opacity"
              style={{ transform: `translateX(-50%) scale(${1 / scale})` }}
              min={MIN_OPACITY}
              max={MAX_OPACITY}
              step="0.05"
              value={item.opacity ?? 1}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setOpacityAt(item._index, Number(e.target.value))}
              aria-label="調整貼紙透明度"
            />
          </div>
        )
      })}
    </div>
  )
}
