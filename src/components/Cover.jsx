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
  decorationMode,
}) {
  const illustration = parseIllustrationRef(coverPhotoUrl)
  const hasRealPhoto = coverPhotoUrl && !illustration

  return (
    <div className={`cover cover--${style.id} cover--${category.id} ${decorationMode ? 'cover--no-anim' : ''}`}>
      <div className="cover__visual">
        {hasRealPhoto && (
          <div className={`cover__frame cover__frame--${style.id}`}>
            {/* crossOrigin 讓瀏覽器從一開始就用 CORS 模式快取這張圖：R11 下載
                存檔功能會用 html2canvas 把整頁畫進 canvas，如果這張圖之前是用
                「一般模式」載入並被瀏覽器快取，html2canvas 之後用 CORS 模式
                再抓一次可能還是拿到同一份「非 CORS」快取，畫進 canvas 後
                canvas 會被視為 tainted，之後 toBlob() 匯出圖片就會直接被
                瀏覽器擋下來 */}
            <img src={coverPhotoUrl} alt={`給 ${recipientName}`} className="cover__photo" crossOrigin="anonymous" />
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
