const STICKER_PATHS = {
  heart: <path d="M12 19S4 13.8 4 8.8C4 6.1 6.1 4 8.7 4c1.5 0 2.8.7 3.3 1.9C12.5 4.7 13.8 4 15.3 4 17.9 4 20 6.1 20 8.8 20 13.8 12 19 12 19z" />,
  star: <path d="M12 3.5l2.2 5.2 5.6.5-4.3 3.7 1.3 5.5L12 15.6l-4.8 2.8 1.3-5.5-4.3-3.7 5.6-.5z" />,
  ribbon: (
    <>
      <circle cx="12" cy="10" r="1.6" />
      <path d="M12 10c-1-2.3-3.4-3-5.3-1.8-1.3.9-1 2.8.6 3.4 1.5.6 3.4-.1 4.7-1.6z" />
      <path d="M12 10c1-2.3 3.4-3 5.3-1.8 1.3.9 1 2.8-.6 3.4-1.5.6-3.4-.1-4.7-1.6z" />
      <path d="M12 11.5l-2.4 8" />
      <path d="M12 11.5l2.4 8" />
    </>
  ),
  flower: (
    <>
      <ellipse cx="12" cy="7" rx="2.2" ry="3.4" />
      <ellipse cx="12" cy="7" rx="2.2" ry="3.4" transform="rotate(72 12 12)" />
      <ellipse cx="12" cy="7" rx="2.2" ry="3.4" transform="rotate(144 12 12)" />
      <ellipse cx="12" cy="7" rx="2.2" ry="3.4" transform="rotate(216 12 12)" />
      <ellipse cx="12" cy="7" rx="2.2" ry="3.4" transform="rotate(288 12 12)" />
      <circle cx="12" cy="12" r="1.8" />
    </>
  ),
  balloon: (
    <>
      <path d="M12 3a5 5 0 0 1 5 5c0 3.2-2.2 5.3-3.7 6.8L12 16l-1.3-1.2C9.2 13.3 7 11.2 7 8a5 5 0 0 1 5-5z" />
      <path d="M12 16c.6 1 .3 2-.3 2.6" />
      <path d="M12 18.6v3.4" />
    </>
  ),
  handprint: (
    <path d="M9 21v-7.5a1.5 1.5 0 0 1 3 0V12M9 13.5V8a1.5 1.5 0 0 1 3 0v4M12 12V6.5a1.5 1.5 0 0 1 3 0V12M15 12.5V8a1.5 1.5 0 0 1 3 0v6c0 3.9-2.5 7-6 7h-1c-2 0-3-.8-4.2-2.3L4 15.8c-.5-.6-.4-1.5.2-2 .6-.4 1.4-.3 1.9.2L8 16" />
  ),
  tape: (
    <path d="M3 10 L5 8 L7 10 L9 8 L11 10 L13 8 L15 10 L17 8 L19 10 L21 8 V16 L19 14 L17 16 L15 14 L13 16 L11 14 L9 16 L7 14 L5 16 L3 14 Z" />
  ),
  smiley: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="10" r="1" />
      <circle cx="15" cy="10" r="1" />
      <path d="M8 14q4 4 8 0" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5z" />
      <circle cx="19" cy="19" r="1.4" />
    </>
  ),
  cloud: <path d="M6.5 17a4 4 0 0 1-.5-7.9 5 5 0 0 1 9.6-1.8A4.5 4.5 0 0 1 17.5 17z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </>
  ),
  moon: <path d="M18 13.5A7.5 7.5 0 1 1 10.5 6a6 6 0 0 0 7.5 7.5z" />,
  leaf: (
    <>
      <path d="M5 19c0-8 4-13 14-14-1 10-6 14-14 14z" />
      <path d="M6 18c3-4 6-7 12-12" />
    </>
  ),
  gift: (
    <>
      <rect x="4" y="10" width="16" height="10" rx="1" />
      <path d="M4 14h16" />
      <path d="M12 10v10" />
      <path d="M12 10q-2.5-6 -6-4q-1 3 6 4" />
      <path d="M12 10q2.5-6 6-4q1 3 -6 4" />
    </>
  ),
  thumbsup: (
    <path d="M7 11v9H4v-9zM7 11l3.5-7c.5-1 2-1 2.4.2L14 8v3h4a2 2 0 0 1 2 2.4l-1.2 6A2 2 0 0 1 16.8 21H9a2 2 0 0 1-2-2v-8z" />
  ),
  confetti: (
    <>
      <rect x="4" y="4" width="2.4" height="2.4" transform="rotate(20 5 5)" />
      <circle cx="16" cy="6" r="1.3" />
      <path d="M18 15l1.5 3-3-1.5z" />
      <rect x="7" y="16" width="2.2" height="2.2" transform="rotate(-15 8 17)" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),

  // ===== 插畫風（可愛動物/自然物，線條為主，局部低透明度 fill 點綴）=====
  cat: (
    <>
      <path d="M6 9l1.5-4 2.5 3M18 9l-1.5-4-2.5 3" />
      <circle cx="12" cy="13" r="6.5" />
      <circle cx="9.5" cy="12.5" r="0.8" fill="currentColor" />
      <circle cx="14.5" cy="12.5" r="0.8" fill="currentColor" />
      <path d="M10.5 15.5q1.5 1.2 3 0" />
      <path d="M6 14h-2M6 15.5h-2.3M18 14h2M18 15.5h2.3" />
    </>
  ),
  dog: (
    <>
      <ellipse cx="7" cy="10" rx="2.4" ry="3.6" transform="rotate(-20 7 10)" />
      <ellipse cx="17" cy="10" rx="2.4" ry="3.6" transform="rotate(20 17 10)" />
      <circle cx="12" cy="13" r="6" />
      <circle cx="9.7" cy="12.5" r="0.8" fill="currentColor" />
      <circle cx="14.3" cy="12.5" r="0.8" fill="currentColor" />
      <circle cx="12" cy="14.3" r="1" fill="currentColor" />
      <path d="M12 15.3v1.2M9.5 17q2.5 1.4 5 0" />
    </>
  ),
  bear: (
    <>
      <circle cx="7.5" cy="7" r="2.2" />
      <circle cx="16.5" cy="7" r="2.2" />
      <circle cx="12" cy="13" r="6.5" />
      <circle cx="9.5" cy="12.5" r="0.8" fill="currentColor" />
      <circle cx="14.5" cy="12.5" r="0.8" fill="currentColor" />
      <ellipse cx="12" cy="15" rx="2" ry="1.5" fill="currentColor" fillOpacity="0.18" />
      <path d="M12 14.3v1M10.3 16.2q1.7 1 3.4 0" />
    </>
  ),
  bunny: (
    <>
      <ellipse cx="9.5" cy="5.5" rx="1.6" ry="4.2" transform="rotate(-8 9.5 5.5)" />
      <ellipse cx="14.5" cy="5.5" rx="1.6" ry="4.2" transform="rotate(8 14.5 5.5)" />
      <circle cx="12" cy="14" r="6" />
      <circle cx="9.8" cy="13.5" r="0.8" fill="currentColor" />
      <circle cx="14.2" cy="13.5" r="0.8" fill="currentColor" />
      <path d="M12 15q-.8 1 -1.6 .2M12 15q.8 1 1.6 .2" />
    </>
  ),
  cloud_face: (
    <>
      <path d="M6.5 17a4 4 0 0 1-.5-7.9 5 5 0 0 1 9.6-1.8A4.5 4.5 0 0 1 17.5 17z" />
      <circle cx="9.5" cy="13" r="0.7" fill="currentColor" />
      <circle cx="14" cy="13" r="0.7" fill="currentColor" />
      <path d="M9.8 15.2q1.7 1.3 3.4 0" />
    </>
  ),
  sun_face: (
    <>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
      <circle cx="10.2" cy="11" r="0.6" fill="currentColor" />
      <circle cx="13.8" cy="11" r="0.6" fill="currentColor" />
      <path d="M10.3 13.3q1.7 1.2 3.4 0" />
    </>
  ),
  flower_cute: (
    <>
      <ellipse cx="12" cy="7.2" rx="2.6" ry="3.6" />
      <ellipse cx="12" cy="7.2" rx="2.6" ry="3.6" transform="rotate(72 12 12)" />
      <ellipse cx="12" cy="7.2" rx="2.6" ry="3.6" transform="rotate(144 12 12)" />
      <ellipse cx="12" cy="7.2" rx="2.6" ry="3.6" transform="rotate(216 12 12)" />
      <ellipse cx="12" cy="7.2" rx="2.6" ry="3.6" transform="rotate(288 12 12)" />
      <circle cx="12" cy="12" r="2.1" />
      <circle cx="11.2" cy="11.7" r="0.4" fill="currentColor" />
      <circle cx="12.8" cy="11.7" r="0.4" fill="currentColor" />
      <path d="M11.3 12.6q.7 .5 1.4 0" />
    </>
  ),
  rainbow: (
    <>
      <path d="M3 17a9 9 0 0 1 18 0" />
      <path d="M6 17a6 6 0 0 1 12 0" />
      <path d="M9 17a3 3 0 0 1 6 0" />
      <circle cx="4" cy="19" r="1" fill="currentColor" />
      <circle cx="20" cy="19" r="1" fill="currentColor" />
    </>
  ),
  cake: (
    <>
      <path d="M12 3v2.8" />
      <circle cx="12" cy="2.6" r="0.9" fill="currentColor" />
      <rect x="5" y="11" width="14" height="7" rx="1.5" />
      <path d="M5 14.5h14" />
      <path d="M8 11l.6-2M12 11l-.6-2M16 11l.6-2" />
    </>
  ),

  // ===== 膠帶造型（面為主，fill=currentColor，花紋用固定半透明白色疊加）=====
  tape_plain: (
    <g transform="rotate(-10 12 12)">
      <rect x="1" y="8.5" width="22" height="7" rx="1" fill="currentColor" />
      <rect x="1" y="8.5" width="22" height="1.4" rx="0.7" fill="#fff" fillOpacity="0.35" />
    </g>
  ),
  tape_stripe: (
    <g transform="rotate(-10 12 12)">
      <rect x="1" y="8.5" width="22" height="7" rx="1" fill="currentColor" />
      <rect x="3" y="8.5" width="1.6" height="7" fill="#fff" fillOpacity="0.5" />
      <rect x="8" y="8.5" width="1.6" height="7" fill="#fff" fillOpacity="0.5" />
      <rect x="13" y="8.5" width="1.6" height="7" fill="#fff" fillOpacity="0.5" />
      <rect x="18" y="8.5" width="1.6" height="7" fill="#fff" fillOpacity="0.5" />
    </g>
  ),
  tape_dot: (
    <g transform="rotate(-10 12 12)">
      <rect x="1" y="8.5" width="22" height="7" rx="1" fill="currentColor" />
      <circle cx="5" cy="12" r="1" fill="#fff" fillOpacity="0.55" />
      <circle cx="9.5" cy="12" r="1" fill="#fff" fillOpacity="0.55" />
      <circle cx="14" cy="12" r="1" fill="#fff" fillOpacity="0.55" />
      <circle cx="18.5" cy="12" r="1" fill="#fff" fillOpacity="0.55" />
    </g>
  ),
  tape_grid: (
    <g transform="rotate(-10 12 12)">
      <rect x="1" y="8.5" width="22" height="7" rx="1" fill="currentColor" />
      <path d="M6 8.5v7M11 8.5v7M16 8.5v7M21 8.5v7" stroke="#fff" strokeOpacity="0.45" strokeWidth="1" fill="none" />
      <path d="M1 10.5h22M1 13.5h22" stroke="#fff" strokeOpacity="0.45" strokeWidth="1" fill="none" />
    </g>
  ),
  tape_zigzag: (
    <path
      d="M1 9l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1v6l-2-1-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"
      transform="rotate(-10 12 12)"
      fill="currentColor"
    />
  ),
  tape_scallop: (
    <g transform="rotate(-10 12 12)" fill="currentColor">
      <rect x="2" y="9" width="20" height="6" rx="1" />
      <circle cx="4" cy="9" r="1.6" />
      <circle cx="8" cy="9" r="1.6" />
      <circle cx="12" cy="9" r="1.6" />
      <circle cx="16" cy="9" r="1.6" />
      <circle cx="20" cy="9" r="1.6" />
      <circle cx="4" cy="15" r="1.6" />
      <circle cx="8" cy="15" r="1.6" />
      <circle cx="12" cy="15" r="1.6" />
      <circle cx="16" cy="15" r="1.6" />
      <circle cx="20" cy="15" r="1.6" />
    </g>
  ),
  tape_stitch: (
    <g transform="rotate(-10 12 12)">
      <rect x="1" y="8.5" width="22" height="7" rx="1" fill="currentColor" />
      <path d="M2 12h20" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.4" strokeDasharray="2 1.6" fill="none" />
    </g>
  ),
  tape_arrow: (
    <g transform="rotate(-10 12 12)">
      <rect x="1" y="8.5" width="22" height="7" rx="1" fill="currentColor" />
      <path
        d="M4 12h14M14 9.5l3 2.5-3 2.5"
        stroke="#fff"
        strokeOpacity="0.6"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  ),
}

export default function StickerIcon({ stickerId, className, color }) {
  const content = STICKER_PATHS[stickerId]
  if (!content) return null
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={color ? { color } : undefined}
    >
      {content}
    </svg>
  )
}
