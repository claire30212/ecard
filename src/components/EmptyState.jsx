import BuiltInIllustration from './BuiltInIllustration'

export default function EmptyState({ category, recipientName }) {
  return (
    <div className="empty-state">
      <div className="empty-state__card">
        <BuiltInIllustration categoryId={category.id} variant="2" className="empty-state__icon" />
        <p className="empty-state__text">還沒有人留言，當第一個祝福 {recipientName} 的人吧</p>
      </div>
    </div>
  )
}
