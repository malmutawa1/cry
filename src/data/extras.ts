// Extra-capacity add-ons, unlocked once the monthly allowance is used up.
export interface Extra {
  kg: number
  priceKwd: number
}

export const extras: Extra[] = [
  { kg: 5, priceKwd: 2 },
  { kg: 8, priceKwd: 5 },
]
