import { useEffect, useState } from 'react'
import {
  getRushSettings,
  getLedger,
  rushCountToday,
  rushCapReached,
  subscribeRush,
} from './data/rush'

/** Live view of rush settings + today's cap usage. Re-renders on any change
 *  (same tab or the other app, since they share origin storage). */
export function useRush() {
  const [, force] = useState(0)
  useEffect(() => subscribeRush(() => force((n) => n + 1)), [])
  const settings = getRushSettings()
  const ledger = getLedger()
  return {
    settings,
    ledger,
    countToday: rushCountToday(ledger),
    capReached: rushCapReached(settings, ledger),
  }
}
