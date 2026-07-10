import BuiltInIllustration from './BuiltInIllustration'
import { parseIllustrationRef } from '../lib/constants'

export default function Cover({
  category,
  style,
  recipientName,
  coverPhotoUrl,
  blessingMessage,
  showBlessing,
  creatorSignature,
  showSignature,
}) {
  const illustration = parseIllustrationRef(coverPhotoUrl)
  const hasRealPhoto = coverPhotoUrl && !illustration

  return (
    <div className={`cover cover--${style.id} cover--${category.id}`}>
      <div className="cover__visual">
        {hasRealPhoto && (
          <div className={`cover__frame cover__frame--${style.id}`}>
            <img src={coverPhotoUrl} alt={`給 ${recipientName}`} className="cover__photo" />
          </div>
        )}

        {illustration && (
          <div className="cover__illustration-wrap">
            <BuiltInIllustration
              categoryId={illustration.categoryId}
              variant={illustration.variant}
              className="cover__illustration"
            />
          </div>
        )}

        {!coverPhotoUrl && (
          <div className="cover__deco" aria-hidden="true">
            <BuiltInIllustration categoryId={category.id} variant="1" className="cover__deco-icon" />
          </div>
        )}

        <h1 className={`cover__name ${!coverPhotoUrl ? 'cover__name--hero' : ''}`}>
          給 {recipientName}
        </h1>
      </div>

      {showBlessing && blessingMessage && <p className="cover__blessing">{blessingMessage}</p>}
      {showSignature && creatorSignature && <p className="cover__signature">— {creatorSignature}</p>}
    </div>
  )
}
