// Message channel between the staff portal and the customer app + POS.
//
// Staff send messages from the Alerts branch; each message is routed to an
// audience (customer / pos / both) and surfaces on that channel's bell. Backed
// by same-origin localStorage + change events (the rush.ts pattern), so the
// three surfaces — customer app, staff portal, POS terminal — stay in sync.

// 'both' is shorthand for customer + pos (a customer-facing broadcast); it does
// NOT include staff. The POS reaches the staff portal with audience 'staff'.
export type NotifAudience = 'customer' | 'pos' | 'staff' | 'both'
export type NotifSurface = 'customer' | 'pos' | 'staff'

export interface Notification {
  id: string
  text: string
  audience: NotifAudience
  ts: number
}

const NOTIF_KEY = 'pressd:notifications'
const SEEN_PREFIX = 'pressd:notif:seen:'
const EVENT = 'pressd:notifications:changed'

const DAY = 86400000
const SEED: Notification[] = [
  { id: 'seed-c', text: 'Welcome to Pressd! Your first pickup earns 50 points.', audience: 'customer', ts: Date.now() - DAY },
  { id: 'seed-p', text: 'Reminder: log QC before dispatching rush orders.', audience: 'pos', ts: Date.now() - DAY },
  { id: 'seed-s', text: 'Facility: 3 rush orders queued — please confirm drivers.', audience: 'staff', ts: Date.now() - 2 * 3600_000 },
]

function emit() {
  try {
    window.dispatchEvent(new Event(EVENT))
  } catch {
    /* non-browser */
  }
}

export function getNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(NOTIF_KEY)
    if (raw == null) return SEED
    const arr = JSON.parse(raw) as Notification[]
    return Array.isArray(arr) ? arr : []
  } catch {
    return SEED
  }
}

function write(list: Notification[]) {
  try {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(list.slice(0, 100)))
  } catch {
    /* storage unavailable */
  }
  emit()
}

/** Is a message delivered to a given surface's bell? */
function reaches(n: Notification, surface: NotifSurface): boolean {
  if (n.audience === surface) return true
  // 'both' is a customer-facing broadcast (customer + pos), never staff.
  if (n.audience === 'both') return surface === 'customer' || surface === 'pos'
  return false
}

/** Messages for a surface, newest first. */
export function notificationsFor(surface: NotifSurface): Notification[] {
  return getNotifications()
    .filter((n) => reaches(n, surface))
    .sort((a, b) => b.ts - a.ts)
}

export function sendNotification(input: { text: string; audience: NotifAudience }): Notification[] {
  const text = input.text.trim()
  if (!text) return getNotifications()
  const next = [{ id: 'n' + Date.now(), text, audience: input.audience, ts: Date.now() }, ...getNotifications()]
  write(next)
  return next
}

export function removeNotification(id: string): Notification[] {
  const next = getNotifications().filter((n) => n.id !== id)
  write(next)
  return next
}

// ---- Per-surface read tracking (unread = messages newer than last seen) ----
export function getLastSeen(surface: NotifSurface): number {
  try {
    return Number(localStorage.getItem(SEEN_PREFIX + surface) || 0)
  } catch {
    return 0
  }
}

export function markSeen(surface: NotifSurface): void {
  try {
    localStorage.setItem(SEEN_PREFIX + surface, String(Date.now()))
  } catch {
    /* storage unavailable */
  }
  emit()
}

export function unreadCount(surface: NotifSurface): number {
  const seen = getLastSeen(surface)
  return notificationsFor(surface).filter((n) => n.ts > seen).length
}

export function subscribeNotifications(cb: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === NOTIF_KEY || e.key.startsWith(SEEN_PREFIX)) cb()
  }
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('storage', onStorage)
  }
}
