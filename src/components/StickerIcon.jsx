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
}

export default function StickerIcon({ stickerId, className }) {
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
    >
      {content}
    </svg>
  )
}
