import { useEffect, useState } from 'react'
import { getAppConfig, resolvePlans, subscribeConfig } from './data/config'

/** Live view of admin app config + plans with overrides applied. Re-renders on
 *  any change (same tab or the other app, since they share origin storage). */
export function useAppConfig() {
  const [, force] = useState(0)
  useEffect(() => subscribeConfig(() => force((n) => n + 1)), [])
  const config = getAppConfig()
  return {
    config,
    announcement: config.announcement,
    plans: resolvePlans(config),
  }
}
