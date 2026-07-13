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
export const Mail = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
)
export const Lock = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
)
export const Logout = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11" /></svg>
)

// Filled Apple logo (uses currentColor).
export const Apple = ({ size = 18, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M16.365 1.43c0 1.14-.417 2.2-1.253 3.02-.836.82-1.84 1.29-2.87 1.21-.12-1.09.44-2.24 1.2-2.98.84-.83 2.02-1.4 2.92-1.25zM20.9 17.1c-.55 1.27-.82 1.83-1.53 2.96-.99 1.56-2.39 3.5-4.12 3.51-1.54.02-1.94-1-4.03-.99-2.09.01-2.53 1.01-4.07.99-1.73-.02-3.05-1.77-4.04-3.33-2.77-4.36-3.06-9.48-1.35-12.2 1.21-1.93 3.13-3.06 4.93-3.06 1.84 0 3 .99 4.52.99 1.48 0 2.38-1 4.51-1 1.61 0 3.31.88 4.53 2.39-3.98 2.18-3.33 7.86.65 9.28z" />
  </svg>
)

// Apple Pay mark: white rounded pill with black apple + "Pay".
export const ApplePayMark = ({ className }: { className?: string }) => (
  <span className={`pay-mark applepay ${className || ''}`}>
    <Apple size={14} />
    <span>Pay</span>
  </span>
)

// Simplified KNET badge (Kuwait's national payment network).
export const KnetMark = ({ className }: { className?: string }) => (
  <span className={`pay-mark knet ${className || ''}`}>
    <span className="k">K</span>
    <span className="net">net</span>
  </span>
)

export const CardIcon = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18M7 15h4" /></svg>
)
export const Store = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><path d="M4 9 5 4h14l1 5M4 9h16M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M4 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0M9 20v-5h6v5" /></svg>
)
export const Car = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><path d="M5 11l1.5-4A2 2 0 0 1 8.4 6h7.2a2 2 0 0 1 1.9 1L19 11M4 11h16a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1M4 11a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1M6 17h12M7 17a1.5 1.5 0 0 0 3 0M14 17a1.5 1.5 0 0 0 3 0" /></svg>
)
export const Route = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><circle cx="6" cy="19" r="2.5" /><circle cx="18" cy="5" r="2.5" /><path d="M8.5 19H14a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h5.5" /></svg>
)
export const Locate = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>
)
export const Sun = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" /></svg>
)
export const Moon = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><path d="M20 14.5A8 8 0 1 1 9.5 4a6.2 6.2 0 0 0 10.5 10.5Z" /></svg>
)
export const Monitor = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>
)
export const Gift = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><path d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8M2 8h20v4H2zM12 21V8M12 8S10.5 4 8 4a2 2 0 0 0 0 4h4M12 8s1.5-4 4-4a2 2 0 0 1 0 4h-4" /></svg>
)
export const Star = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><path d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8L6.6 19.6l1-6L3.3 9.4l6-.9L12 3Z" /></svg>
)
export const Male = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><circle cx="10" cy="14" r="6" /><path d="M14.5 9.5 20 4M20 4h-5M20 4v5" /></svg>
)
export const Female = ({ size = 22, className }: P) => (
  <svg {...base(size, className)}><circle cx="12" cy="9" r="6" /><path d="M12 15v7M9 19h6" /></svg>
)
