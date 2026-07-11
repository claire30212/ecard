// 插畫手繪風用的散佈線條裝飾（氣球、彩帶、星星、愛心、葉子），依類別給對應主題組合。
// 位置固定（非隨機），確保同一張卡片每次載入畫面一致。
const DOODLES = {
  balloon: (
    <>
      <path d="M12 3a5 5 0 0 1 5 5c0 3.2-2.2 5.3-3.7 6.8L12 16l-1.3-1.2C9.2 13.3 7 11.2 7 8a5 5 0 0 1 5-5z" />
      <path d="M12 16c.6 1 .3 2-.3 2.6" />
      <path d="M12 18.6v3.4" />
    </>
  ),
  star: (
    <path d="M12 3.5l2.2 5.2 5.6.5-4.3 3.7 1.3 5.5L12 15.6l-4.8 2.8 1.3-5.5-4.3-3.7 5.6-.5z" />
  ),
  ribbon: (
    <>
      <circle cx="12" cy="10" r="1.6" />
      <path d="M12 10c-1-2.3-3.4-3-5.3-1.8-1.3.9-1 2.8.6 3.4 1.5.6 3.4-.1 4.7-1.6z" />
      <path d="M12 10c1-2.3 3.4-3 5.3-1.8 1.3.9 1 2.8-.6 3.4-1.5.6-3.4-.1-4.7-1.6z" />
      <path d="M12 11.5l-2.4 8" />
      <path d="M12 11.5l2.4 8" />
    </>
  ),
  heart: (
    <path d="M12 19S4 13.8 4 8.8C4 6.1 6.1 4 8.7 4c1.5 0 2.8.7 3.3 1.9C12.5 4.7 13.8 4 15.3 4 17.9 4 20 6.1 20 8.8 20 13.8 12 19 12 19z" />
  ),
  leaf: (
    <>
      <path d="M5 19c0-8 4-13 14-14-1 10-6 14-14 14z" />
      <path d="M6 18c3-4 6-7 12-12" />
    </>
  ),
}

const CATEGORY_SETS = {
  birthday: ['balloon', 'star', 'ribbon', 'balloon'],
  anniversary: ['heart', 'ribbon', 'star', 'heart'],
  blessing: ['leaf', 'star', 'heart', 'leaf'],
  thanks: ['leaf', 'ribbon', 'heart', 'leaf'],
}

// 固定的散佈位置（百分比座標、旋轉角度、尺寸），依類別套用不同圖示但版面配置一致
const SPOTS = [
  { top: '6%', left: '8%', rotate: -12, size: 34 },
  { top: '12%', left: '86%', rotate: 10, size: 28 },
  { top: '78%', left: '4%', rotate: 14, size: 30 },
  { top: '84%', left: '90%', rotate: -8, size: 26 },
]

export default function DoodleScatter({ categoryId, className }) {
  const set = CATEGORY_SETS[categoryId] || CATEGORY_SETS.blessing
  return (
    <div className={`doodle-scatter ${className || ''}`} aria-hidden="true">
      {SPOTS.map((spot, i) => (
        <svg
          key={i}
          className="doodle-scatter__icon"
          viewBox="0 0 24 24"
          width={spot.size}
          height={spot.size}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ top: spot.top, left: spot.left, transform: `rotate(${spot.rotate}deg)` }}
        >
          {DOODLES[set[i % set.length]]}
        </svg>
      ))}
    </div>
  )
}
