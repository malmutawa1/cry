import { useEffect, useState } from 'react'
import {
  notificationsFor,
  unreadCount,
  markSeen,
  subscribeNotifications,
  type NotifSurface,
} from './data/notifications'

/** Live view of the messages routed to a surface (customer app or POS) plus
 *  its unread count. Re-renders on any change, on any surface (shared origin). */
export function useNotifications(surface: NotifSurface) {
  const [, force] = useState(0)
  useEffect(() => subscribeNotifications(() => force((n) => n + 1)), [])
  return {
    list: notificationsFor(surface),
    unread: unreadCount(surface),
    markSeen: () => markSeen(surface),
  }
}
