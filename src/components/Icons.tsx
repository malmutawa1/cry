// Minimal inline line-icon set. Stroke = currentColor so icons inherit text color.

interface P {
  size?: number
  className?: string
}
const base = (size: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className,
})

export const Close = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><path d="M18 6 6 18M6 6l12 12" /></svg>
)
export const Trash = ({ size = 20, className }: P) => (
  <svg {...base(size, className)}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" /></svg>
)
export const Chevron = ({ size = 20, className }: P) => (
  <svg {...base(size, className)}><path d="m9 6 6 6-6 6" /></svg>
)
export const Plus = ({ size = 20, className }: P) => (
  <svg {...base(size, className)}><path d="M12 5v14M5 12h14" /></svg>
)
export const Minus = ({ size = 20, className }: P) => (
  <svg {...base(size, className)}><path d="M5 12h14" /></svg>
)
export const Home = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><path d="M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" /></svg>
)
export const Phone = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><path d="M5 4h3l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>
)
export const CalendarIn = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /><path d="M14 15l-3-2 3-2" /></svg>
)
export const CalendarOut = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /><path d="M10 11l3 2-3 2" /></svg>
)
export const Hanger = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><path d="M12 6a2 2 0 1 1 2 2c-1 0-2 .8-2 2v1M3 18l9-5 9 5a1 1 0 0 1-.5 1.8H3.5A1 1 0 0 1 3 18Z" /></svg>
)
export const Note = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12Z" /></svg>
)
export const Basket = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><path d="M5 8h14l-1.2 11a2 2 0 0 1-2 1.8H8.2A2 2 0 0 1 6.2 19L5 8ZM9 8V6a3 3 0 0 1 6 0v2" /></svg>
)
export const Receipt = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3ZM9 8h6M9 12h6" /></svg>
)
export const User = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
)
export const Cards = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /></svg>
)
export const Check = ({ size = 20, className }: P) => (
  <svg {...base(size, className)}><path d="m5 12 5 5L20 6" /></svg>
)
export const Info = ({ size = 20, className }: P) => (
  <svg {...base(size, className)}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
)
export const Sliders = ({ size = 20, className }: P) => (
  <svg {...base(size, className)}><path d="M4 8h9M17 8h3M4 16h3M11 16h9" /><circle cx="15" cy="8" r="2" /><circle cx="9" cy="16" r="2" /></svg>
)
export const Pin = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
)
export const Leaf = ({ size = 20, className }: P) => (
  <svg {...base(size, className)}><path d="M5 19c0-8 6-13 15-13 0 9-5 15-13 15-2 0-2-2-2-2Z" /><path d="M5 19c3-4 6-6 10-8" /></svg>
)
export const Clock = ({ size = 20, className }: P) => (
  <svg {...base(size, className)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
)
export const Globe = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.5 6 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-6-3.5-9s1-6.5 3.5-9Z" /></svg>
)
export const Bag = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><path d="M6 8h12l-1 12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 8ZM9 8V6a3 3 0 0 1 6 0v2" /></svg>
)
