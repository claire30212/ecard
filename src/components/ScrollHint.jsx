export default function ScrollHint({ onClick }) {
  return (
    <button type="button" className="scroll-hint" onClick={onClick}>
      <svg viewBox="0 0 40 40" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 15 Q20 22 20 30 Q20 22 30 15" />
      </svg>
      <span>往下滑開卡片</span>
    </button>
  )
}
