// Delivery ratings, saved locally after an order is completed. Same-origin
// localStorage keeps it simple; a "seen" set makes sure each order only ever
// prompts once.

export interface Rating {
  orderId: string
  stars: number
  comment?: string
  ts: number
}

const RATINGS_KEY = 'pressd:ratings'
const SEEN_KEY = 'pressd:ratings:seen'

export function getRatings(): Rating[] {
  try {
    const raw = localStorage.getItem(RATINGS_KEY)
    return raw ? (JSON.parse(raw) as Rating[]) : []
  } catch {
    return []
  }
}

export function saveRating(orderId: string, stars: number, comment?: string): void {
  try {
    const list = getRatings().filter((r) => r.orderId !== orderId)
    list.unshift({ orderId, stars, comment: comment?.trim() || undefined, ts: Date.now() })
    localStorage.setItem(RATINGS_KEY, JSON.stringify(list.slice(0, 100)))
  } catch {
    /* storage unavailable */
  }
}

function seenSet(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

/** Has this order already shown the rating prompt (rated or dismissed)? */
export function hasSeenRating(orderId: string): boolean {
  return seenSet().has(orderId)
}

export function markSeenRating(orderId: string): void {
  try {
    const set = seenSet()
    set.add(orderId)
    localStorage.setItem(SEEN_KEY, JSON.stringify([...set].slice(-200)))
  } catch {
    /* storage unavailable */
  }
}
