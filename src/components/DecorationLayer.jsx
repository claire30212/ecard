import StickerIcon from './StickerIcon'

// 唯讀渲染：依 zone 過濾後，用「相對容器的百分比座標」定位貼紙，
// 不用絕對像素，手機/平板/桌機不同版面寬度下位置都一致
export default function DecorationLayer({ decorations, zone }) {
  const items = (decorations || []).filter((d) => d.zone === zone)
  if (items.length === 0) return null

  return (
    <div className="decoration-layer" aria-hidden="true">
      {items.map((d, i) => (
        <div
          key={i}
          className="decoration-layer__item"
          style={{
            left: `${d.x_percent}%`,
            top: `${d.y_percent}%`,
            transform: `translate(-50%, -50%) rotate(${d.rotation || 0}deg) scale(${d.scale || 1})`,
          }}
        >
          <StickerIcon stickerId={d.sticker_id} className="decoration-layer__icon" />
        </div>
      ))}
    </div>
  )
}
