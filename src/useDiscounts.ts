import { useEffect, useState } from 'react'
import { getDiscounts, subscribeDiscounts } from './data/discounts'

/** Live view of the discount-code list (re-renders on any change, any surface). */
export function useDiscounts() {
  const [, force] = useState(0)
  useEffect(() => subscribeDiscounts(() => force((n) => n + 1)), [])
  return { discounts: getDiscounts() }
}
