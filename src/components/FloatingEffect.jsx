import { useMemo } from 'react'
import StickerIcon from './StickerIcon'

// 依類別挑選既有貼紙圖案，沿用同一套線條風格，天然跟三種質感風格搭配不突兀，
// 也不用另外準備新素材
const CATEGORY_PARTICLES = {
  birthday: ['balloon', 'confetti'],
  anniversary: ['leaf', 'sparkle'],
  blessing: ['star', 'sparkle'],
  thanks: ['leaf', 'sun'],
}

const PARTICLE_COUNT = 14

// 用 index 算出固定（非亂數）的位置/大小/延遲/飄移量，避免每次重新渲染
// 粒子位置跳動；純 CSS transform+opacity 動畫，播一次就停，不用 JS 迴圈
export default function FloatingEffect({ categoryId }) {
  const icons = CATEGORY_PARTICLES[categoryId] || CATEGORY_PARTICLES.blessing

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        icon: icons[i % icons.length],
        left: (i * 37 + (i % 3) * 11) % 92 + 4,
        delay: ((i * 0.17) % 1.8).toFixed(2),
        duration: (2.2 + (i % 4) * 0.3).toFixed(2),
        size: 16 + (i % 3) * 6,
        drift: (i % 2 === 0 ? 1 : -1) * (10 + (i % 5) * 4),
      })),
    [icons]
  )

  return (
    <div className="floating-effect" aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className="floating-effect__particle"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--drift': `${p.drift}px`,
          }}
        >
          <StickerIcon stickerId={p.icon} className="floating-effect__icon" />
        </span>
      ))}
    </div>
  )
}
