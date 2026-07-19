import { useState } from 'react'
import { useI18n } from '../i18n'
import { useStore } from '../store'
import { saveRating } from '../data/ratings'
import { Check } from './Icons'

function StarShape({ filled }: { filled: boolean }) {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.5l2.9 5.87 6.48.94-4.69 4.57 1.11 6.45L12 17.77l-5.8 3.05 1.1-6.45-4.68-4.57 6.48-.94L12 2.5Z"
        fill={filled ? '#f5b301' : 'none'}
        stroke={filled ? '#f5b301' : 'currentColor'}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Post-delivery rating pop-up: pick 1–5 stars, submit, see a thank-you. */
export default function RatingSheet({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const { t } = useI18n()
  const { showToast } = useStore()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const shown = hover || rating

  function submit() {
    if (rating === 0) return
    saveRating(orderId, rating, comment)
    showToast(t('rate.toast'))
    setSubmitted(true)
    setTimeout(onClose, 1500)
  }

  return (
    <div className="rate-scrim" onClick={onClose}>
      <div className="rate-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {submitted ? (
          <div className="rate-thanks">
            <span className="rate-thanks-ic"><Check size={26} /></span>
            <h2 className="rate-title">{t('rate.thanks.title')}</h2>
            <p className="rate-sub">{t('rate.thanks.sub')}</p>
          </div>
        ) : (
          <>
            <h2 className="rate-title">{t('rate.title')}</h2>
            <p className="rate-sub">{t('rate.sub', { id: orderId })}</p>

            <div className="rate-stars" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={`rate-star${n <= shown ? ' on' : ''}`}
                  onMouseEnter={() => setHover(n)}
                  onClick={() => setRating(n)}
                  aria-label={t('rate.aria', { n })}
                  aria-pressed={n <= rating}
                >
                  <StarShape filled={n <= shown} />
                </button>
              ))}
            </div>

            <div className="rate-label">{shown ? t(`rate.l${shown}`) : t('rate.pick')}</div>

            {rating > 0 && (
              <textarea
                className="field rate-comment"
                value={comment}
                placeholder={t('rate.comment.ph')}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
              />
            )}

            <button className="btn-primary" disabled={rating === 0} onClick={submit} style={{ marginTop: 4 }}>
              {t('rate.submit')}
            </button>
            <button className="rate-skip" onClick={onClose}>{t('rate.skip')}</button>
          </>
        )}
      </div>
    </div>
  )
}
