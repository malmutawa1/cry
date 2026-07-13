import { useStore, orderStage, STAGE_COUNT } from '../store'
import { useI18n } from '../i18n'
import { useNow } from '../useNow'
import { Chevron, Check, Close, Receipt, Route } from '../components/Icons'

const MONTHS: Record<string, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
}

function formatDate(ts: number, lang: string): string {
  const d = new Date(ts)
  return `${d.getDate()} ${(MONTHS[lang] || MONTHS.en)[d.getMonth()]}`
}

export default function History({ onBack, onTrack }: { onBack: () => void; onTrack: () => void }) {
  const { orders } = useStore()
  const { t, lang } = useI18n()
  const now = useNow(1000)

  return (
    <>
      <div className="topbar">
        <button className="round-btn" onClick={onBack} aria-label="Back">
          <Close />
        </button>
        <h1>{t('history.title')}</h1>
        <span style={{ width: 42 }} />
      </div>

      <div className="screen">
        {orders.length === 0 ? (
          <div className="empty">
            <div className="em-ic"><Receipt size={30} /></div>
            <h3>{t('history.empty.title')}</h3>
            <p>{t('history.empty.sub')}</p>
          </div>
        ) : (
          <div className="card-group" style={{ marginTop: 4 }}>
            {orders.map((o) => {
              const done = orderStage(o, now) >= STAGE_COUNT - 1
              return (
                <button
                  key={o.id}
                  className="row"
                  onClick={done ? undefined : onTrack}
                  style={{ cursor: done ? 'default' : 'pointer' }}
                >
                  <span className={`row-ic ${done ? 'ok' : 'live'}`}>
                    {done ? <Check size={18} /> : <Route size={18} />}
                  </span>
                  <span className="row-body">
                    <span className="value">{t('track.order', { id: o.id })}</span>
                    <span className="label">
                      {formatDate(o.createdAt, lang)} · {t('history.sub')}
                    </span>
                  </span>
                  {done ? (
                    <span className="hist-badge done">{t('history.done')}</span>
                  ) : (
                    <span className="hist-badge live">{t('history.active')}</span>
                  )}
                  {!done && <Chevron className="chev" />}
                </button>
              )
            })}
          </div>
        )}
        <div style={{ height: 12 }} />
      </div>
    </>
  )
}
