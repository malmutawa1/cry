import { useEffect, useRef, useState } from 'react'
import { useStore } from './store'

/**
 * Animate a number from 0 → target with an ease-out curve.
 * Returns the target immediately when motion is reduced (user toggle or OS
 * preference), so the count-up self-guards independent of the CSS kill-switch.
 */
export function useCountUp(target: number, duration = 900): number {
  const { reduceMotion } = useStore()
  const [value, setValue] = useState(target)
  const frame = useRef<number>()

  useEffect(() => {
    const osReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion || osReduced) {
      setValue(target)
      return
    }

    const start = performance.now()
    const from = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3) // ease-out cubic
      setValue(Math.round(from + (target - from) * eased))
      if (t < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [target, duration, reduceMotion])

  return value
}
