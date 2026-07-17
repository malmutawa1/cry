import { useState } from 'react'
import { useI18n } from '../i18n'
import { useNotifications } from '../useNotifications'
import type { NotifSurface } from '../data/notifications'
import { Sheet } from './Sheet'
import { Bell } from './Icons'

function relTime(ts: number, t: (k: string, v?: Record<string, string | number>) => string): string {
  const mins = Math.round((Date.now() - ts) / 60000)
  if (mins < 1) return t('alerts.note.now')
  if (mins < 60) return t('alerts.note.min', { n: mins })
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return t('alerts.note.hr', { n: hrs })
  return t('alerts.note.day', { n: Math.round(hrs / 24) })
}

/** Bell button (with unread badge) that opens a surface's message inbox. */
export default function NotificationsBell({ surface = 'customer' }: { surface?: NotifSurface }) {
  const { t } = useI18n()
  const { list, unread, markSeen } = useNotifications(surface)
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className="round-btn bell-btn"
        onClick={() => { setOpen(true); markSeen() }}
        aria-label={t('notif.bell')}
      >
        <Bell />
        {unread > 0 && <span className="bell-badge">{unread}</span>}
      </button>

      {open && (
        <Sheet onClose={() => setOpen(false)}>
          {() => (
            <>
              <div className="grabber" />
              <h3>{t('notif.title')}</h3>
              <div className="sheet-scroll">
                {list.length === 0 ? (
                  <div className="notif-empty">
                    <Bell size={26} />
                    <p>{t('notif.empty')}</p>
                  </div>
                ) : (
                  <div className="notif-list">
                    {list.map((n) => (
                      <div key={n.id} className="notif-item">
                        <span className="notif-dot"><Bell size={15} /></span>
                        <div className="notif-body">
                          <div className="notif-text">{n.text}</div>
                          <div className="notif-time">{relTime(n.ts, t)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </Sheet>
      )}
    </>
  )
}
