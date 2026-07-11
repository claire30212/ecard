// 系統內建插畫底圖，依類別提供對應主題，線條風格可套用於三種質感風格
const ILLUSTRATIONS = {
  birthday: {
    1: (
      <>
        <path d="M40 130 v-40 a30 30 0 0 1 60 0 v40 z" />
        <path d="M40 110 h60" />
        <path d="M55 90 q5 -8 0 -16 q-5 8 0 16" />
        <path d="M70 90 q5 -8 0 -16 q-5 8 0 16" />
        <path d="M85 90 q5 -8 0 -16 q-5 8 0 16" />
        <circle cx="55" cy="66" r="3" />
        <circle cx="70" cy="66" r="3" />
        <circle cx="85" cy="66" r="3" />
        <path d="M20 150 q10 -6 20 0 q10 6 20 0 q10 -6 20 0 q10 6 20 0 q10 -6 20 0" />
      </>
    ),
    2: (
      <>
        <ellipse cx="55" cy="70" rx="18" ry="24" />
        <ellipse cx="95" cy="60" rx="16" ry="22" />
        <ellipse cx="75" cy="95" rx="17" ry="23" />
        <path d="M55 94 v40 M95 82 v52 M75 118 v16" />
        <path d="M52 94 l6 8 M92 82 l6 8 M72 118 l6 6" />
      </>
    ),
    3: (
      <>
        <rect x="45" y="80" width="60" height="55" rx="4" />
        <path d="M45 100 h60" />
        <path d="M75 80 v55" />
        <path d="M75 80 q-8 -20 -22 -14 q-2 14 22 14" />
        <path d="M75 80 q8 -20 22 -14 q2 14 -22 14" />
      </>
    ),
    4: (
      <>
        <path d="M75 50 L52 122 Q75 132 98 122 Z" />
        <circle cx="75" cy="47" r="6" />
        <circle cx="65" cy="90" r="3" />
        <circle cx="82" cy="100" r="3" />
        <circle cx="70" cy="110" r="3" />
      </>
    ),
    5: (
      <>
        <path d="M48 95 h54 l-6 40 h-42 z" />
        <path d="M48 95 q27 -20 54 0" />
        <path d="M75 75 v-15" />
        <path d="M75 60 q4 -8 0 -14 q-4 6 0 14" />
      </>
    ),
  },
  anniversary: {
    1: (
      <>
        <circle cx="65" cy="90" r="22" />
        <circle cx="95" cy="90" r="22" />
        <path d="M80 55 q-10 -14 -24 -6 q-10 8 2 20 q8 8 22 18 q14 -10 22 -18 q12 -12 2 -20 q-14 -8 -24 6 z" />
      </>
    ),
    2: (
      <>
        <path d="M30 100 q40 -50 80 0" />
        <path d="M30 100 q40 40 80 0" />
        <circle cx="70" cy="100" r="5" />
        <path d="M50 60 q-6 -10 -16 -4 q-8 6 2 14 q6 6 14 12 q8 -6 14 -12 q10 -8 2 -14 q-10 -6 -16 4 z" />
      </>
    ),
    3: (
      <>
        <path d="M55 50 l6 30 q0 8 9 8 q9 0 9 -8 l6 -30 z" />
        <path d="M70 88 v22" />
        <path d="M60 110 h20" />
        <path d="M85 50 l6 30 q0 8 9 8 q9 0 9 -8 l6 -30 z" />
        <path d="M100 88 v22" />
        <path d="M90 110 h20" />
      </>
    ),
    4: (
      <>
        <path d="M75 90 q-20 -30 -45 -20 q10 25 45 20" />
        <path d="M75 90 q20 -30 45 -20 q-10 25 -45 20" />
        <circle cx="75" cy="95" r="8" />
      </>
    ),
    5: (
      <>
        <rect x="45" y="60" width="60" height="55" rx="6" />
        <path d="M45 80 h60" />
        <path d="M60 55 v10 M90 55 v10" />
        <path d="M75 105 q-10 -10 -16 -18 q-6 -10 4 -16 q8 -5 12 4 q4 -9 12 -4 q10 6 4 16 q-6 8 -16 18 z" />
      </>
    ),
  },
  blessing: {
    1: (
      <>
        <path d="M75 130 v-50" />
        <path d="M75 80 q-24 -6 -30 -30 q26 2 30 30" />
        <path d="M75 80 q24 -6 30 -30 q-26 2 -30 30" />
        <path d="M75 100 q-18 -4 -22 -22 q20 2 22 22" />
        <path d="M75 100 q18 -4 22 -22 q-20 2 -22 22" />
      </>
    ),
    2: (
      <>
        <path d="M40 110 q35 30 70 0" />
        <path d="M55 110 q10 -30 20 -30 q10 0 20 30" />
        <circle cx="75" cy="72" r="6" />
        <path d="M40 110 q35 -14 70 0" />
      </>
    ),
    3: (
      <>
        <path d="M40 90 q20 -25 45 -15 q-5 10 -15 12 q10 2 20 -2 q-8 15 -25 15 q-15 0 -25 -10 z" />
        <circle cx="48" cy="82" r="2.5" />
        <path d="M85 95 q10 -4 18 -12" />
        <path d="M92 89 q3 -4 2 -8 M98 85 q3 -3 3 -7" />
      </>
    ),
    4: (
      <>
        <path d="M60 140 h30 v-70 h-30 z" />
        <path d="M75 70 q-3 -10 0 -16 q3 6 0 16" />
        <path d="M60 100 h30 M60 120 h30" />
      </>
    ),
    5: (
      <>
        <path d="M75 90 q-18 -15 -20 -32 q18 2 20 32z" />
        <path d="M75 90 q18 -15 20 -32 q-18 2 -20 32z" />
        <path d="M75 90 q-15 18 -32 20 q2 -18 32 -20z" />
        <path d="M75 90 q15 18 32 20 q-2 -18 -32 -20z" />
        <path d="M75 90 v25" />
      </>
    ),
  },
  thanks: {
    1: (
      <>
        <path d="M75 135 v-45" />
        <path d="M75 90 q-4 -22 -22 -28 q-2 22 22 28" />
        <path d="M75 90 q4 -22 22 -28 q2 22 -22 28" />
        <path d="M75 100 q-14 -8 -14 -24" />
        <path d="M75 100 q14 -8 14 -24" />
        <ellipse cx="75" cy="58" rx="10" ry="8" />
      </>
    ),
    2: (
      <>
        <rect x="45" y="80" width="60" height="50" rx="4" />
        <path d="M45 100 h60" />
        <path d="M75 80 v50" />
        <path d="M60 80 q-6 -20 15 -24 q4 12 -15 24" />
        <path d="M90 80 q6 -20 -15 -24 q-4 12 15 24" />
      </>
    ),
    3: (
      <>
        <path d="M45 90 h50 v25 q0 15 -25 15 q-25 0 -25 -15 z" />
        <path d="M95 95 q12 0 12 12 q0 12 -12 12" />
        <path d="M60 85 q-3 -10 3 -18 M75 85 q-3 -10 3 -18 M90 85 q-3 -10 3 -18" />
      </>
    ),
    4: (
      <>
        <rect x="40" y="65" width="70" height="50" rx="4" />
        <path d="M40 65 l35 30 l35 -30" />
        <path d="M75 95 q-6 -8 -12 -3 q-5 4 3 11 q5 4 9 8 q4 -4 9 -8 q8 -7 3 -11 q-6 -5 -12 3 z" />
      </>
    ),
    5: (
      <>
        <path d="M55 130 h40 l-5 -25 h-30 z" />
        <path d="M75 105 v-30" />
        <path d="M75 90 q-15 -5 -18 -20 q15 0 18 20" />
        <path d="M75 85 q15 -5 18 -20 q-15 0 -18 20" />
        <path d="M75 75 q-8 -12 0 -22 q8 10 0 22" />
      </>
    ),
  },
}

export default function BuiltInIllustration({ categoryId, variant = '1', className }) {
  const group = ILLUSTRATIONS[categoryId] || ILLUSTRATIONS.blessing
  const content = group[variant] || group[Object.keys(group)[0]]
  return (
    <svg
      viewBox="0 0 150 160"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {content}
    </svg>
  )
}
