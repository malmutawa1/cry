// Shift handover notes — a small internal board staff use to pass along
// context across shifts (e.g. "Dryer 2 down", "VIP pickup at 4pm").
//
// Persisted to same-origin localStorage and synced across surfaces via change
// events, mirroring the rush.ts / config.ts pattern.

export interface ShiftNote {
  id: string
  text: string
  ts: number
}

const NOTES_KEY = 'pressd:shiftnotes'
const EVENT = 'pressd:shiftnotes:changed'

const SEED: ShiftNote[] = [
  { id: 'n-seed-1', text: 'Dryer 2 running slow — flag to maintenance if it repeats.', ts: Date.now() - 3600_000 },
]

function emit() {
  try {
    window.dispatchEvent(new Event(EVENT))
  } catch {
    /* non-browser */
  }
}

export function getShiftNotes(): ShiftNote[] {
  try {
    const raw = localStorage.getItem(NOTES_KEY)
    if (raw == null) return SEED
    const arr = JSON.parse(raw) as ShiftNote[]
    return Array.isArray(arr) ? arr : []
  } catch {
    return SEED
  }
}

function write(list: ShiftNote[]) {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(list.slice(0, 50)))
  } catch {
    /* storage unavailable */
  }
  emit()
}

export function addShiftNote(text: string): ShiftNote[] {
  const t = text.trim()
  if (!t) return getShiftNotes()
  const next = [{ id: 'n' + Date.now(), text: t, ts: Date.now() }, ...getShiftNotes()]
  write(next)
  return next
}

export function removeShiftNote(id: string): ShiftNote[] {
  const next = getShiftNotes().filter((n) => n.id !== id)
  write(next)
  return next
}

export function subscribeShiftNotes(cb: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === NOTES_KEY || e.key === null) cb()
  }
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('storage', onStorage)
  }
}
