// Inline SVG garment illustrations — self-contained (no external images),
// styled to echo the reference app's "clothing on a hanger" product shots.

interface Props {
  art: string
  className?: string
}

const hanger = (
  <g stroke="#c9ccd1" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M100 26c0-6 5-10 10-10s10 4 10 9c0 4-3 6-6 8" />
    <path d="M114 41 60 66c-4 2-4 6 0 8l54 10 54-10c4-2 4-6 0-8L114 41Z" transform="translate(-14,0)" />
  </g>
)

function Dishdasha({ fill }: { fill: string }) {
  return (
    <>
      {hanger}
      <path
        d="M100 44c-10 0-15 6-24 12-6 4-14 9-14 9l7 16 12-6v112c0 5 3 8 8 8h22c5 0 8-3 8-8V75l12 6 7-16s-8-5-14-9c-9-6-14-12-24-12Z"
        fill={fill}
        stroke="#0b0b0d"
        strokeWidth="1"
      />
      <path d="M100 52v150" stroke="#0b0b0d" strokeWidth="1.2" opacity="0.35" />
      <rect x="108" y="92" width="16" height="20" rx="2" fill="none" stroke="#0b0b0d" strokeWidth="1.2" opacity="0.35" />
      <circle cx="100" cy="64" r="1.6" fill="#0b0b0d" opacity="0.4" />
      <circle cx="100" cy="74" r="1.6" fill="#0b0b0d" opacity="0.4" />
    </>
  )
}

function Besht({ fill, trim }: { fill: string; trim: string }) {
  return (
    <>
      {hanger}
      <path
        d="M100 46c-14 0-22 6-40 14-14 6-24 12-24 12l10 20 22-12v98c0 5 3 8 8 8h48c5 0 8-3 8-8v-98l22 12 10-20s-10-6-24-12c-18-8-26-14-40-14Z"
        fill={fill}
        stroke="#0b0b0d"
        strokeWidth="1"
      />
      <path d="M100 50 84 196M100 50l16 146" stroke={trim} strokeWidth="4" fill="none" opacity="0.9" />
      <path d="M92 60c4 6 12 6 16 0" stroke={trim} strokeWidth="3" fill="none" />
    </>
  )
}

function Abaya({ fill }: { fill: string }) {
  return (
    <>
      {hanger}
      <path
        d="M100 46c-12 0-18 6-34 13-12 5-22 11-22 11l9 19 20-11v108c0 5 3 8 8 8h38c5 0 8-3 8-8V78l20 11 9-19s-10-6-22-11c-16-7-22-13-34-13Z"
        fill={fill}
        stroke="#2b2b30"
        strokeWidth="1"
      />
      <path d="M100 52v152" stroke="#000" strokeWidth="1" opacity="0.5" />
    </>
  )
}

function Dress({ fill }: { fill: string }) {
  return (
    <>
      {hanger}
      <path
        d="M100 48c-8 0-13 5-20 9-6 3-13 8-13 8l6 14 10-6 3 10-22 108c-1 5 2 7 7 7h58c5 0 6-2 5-7L119 83l3-10 10 6 6-14s-7-5-13-8c-7-4-12-9-20-9Z"
        fill={fill}
        stroke="#0b0b0d"
        strokeWidth="1"
      />
      <path d="M84 96h32M80 128h40M74 164h52" stroke="#0b0b0d" strokeWidth="1" opacity="0.25" />
    </>
  )
}

function Shirt({ fill }: { fill: string }) {
  return (
    <>
      {hanger}
      <path
        d="M100 50c-7 0-11 4-11 4l-30 16c-4 2-5 5-3 9l8 14 14-8v96c0 4 3 7 7 7h36c4 0 7-3 7-7v-96l14 8 8-14c2-4 1-7-3-9l-30-16s-4-4-11-4Z"
        fill={fill}
        stroke="#0b0b0d"
        strokeWidth="1"
      />
      <path d="M89 54l11 12 11-12" fill="none" stroke="#0b0b0d" strokeWidth="1.4" />
      <path d="M100 70v122" stroke="#0b0b0d" strokeWidth="1" opacity="0.3" />
    </>
  )
}

function Trousers({ fill }: { fill: string }) {
  return (
    <>
      {hanger}
      <path
        d="M74 62h52c3 0 5 2 5 5l-4 130c0 3-2 5-5 5h-14c-3 0-5-2-5-5l-3-92-3 92c0 3-2 5-5 5H78c-3 0-5-2-5-5L69 67c0-3 2-5 5-5Z"
        fill={fill}
        stroke="#0b0b0d"
        strokeWidth="1"
      />
      <path d="M74 62h52" stroke="#0b0b0d" strokeWidth="2" opacity="0.4" />
    </>
  )
}

function Ghutra({ fill }: { fill: string }) {
  return (
    <>
      <path
        d="M60 60h80l-8 120c-1 8-6 14-14 18-8 4-14 4-18 4s-10 0-18-4c-8-4-13-10-14-18L60 60Z"
        fill={fill}
        stroke="#0b0b0d"
        strokeWidth="1"
      />
      <path d="M60 60h80" stroke="#c9ccd1" strokeWidth="4" />
      <g stroke="#d24" strokeWidth="1.2" opacity="0.5">
        <path d="M70 90l60 10M68 120l64 12M70 150l56 12" />
      </g>
    </>
  )
}

function Bedsheet({ fill }: { fill: string }) {
  return (
    <>
      {hanger}
      <rect x="56" y="70" width="88" height="120" rx="6" fill={fill} stroke="#0b0b0d" strokeWidth="1" />
      <path d="M56 92h88M56 168h88" stroke="#0b0b0d" strokeWidth="1" opacity="0.25" />
      <path d="M70 70v120M130 70v120" stroke="#0b0b0d" strokeWidth="1" opacity="0.18" />
    </>
  )
}

function Towel({ fill }: { fill: string }) {
  return (
    <>
      {hanger}
      <rect x="66" y="66" width="68" height="128" rx="5" fill={fill} stroke="#0b0b0d" strokeWidth="1" />
      <path d="M66 176h68M66 84h68" stroke="#0b0b0d" strokeWidth="2" opacity="0.3" />
    </>
  )
}

function Blanket({ fill }: { fill: string }) {
  return (
    <>
      <rect x="48" y="60" width="104" height="130" rx="10" fill={fill} stroke="#0b0b0d" strokeWidth="1" />
      <rect x="48" y="60" width="104" height="18" rx="9" fill="#0b0b0d" opacity="0.12" />
      <path d="M64 96h72M64 118h72M64 140h72M64 162h72" stroke="#0b0b0d" strokeWidth="1" opacity="0.15" />
    </>
  )
}

export default function Garment({ art, className }: Props) {
  let inner
  switch (art) {
    case 'besht':
      inner = <Besht fill="#4a3b33" trim="#c9a24a" />
      break
    case 'dishdasha':
      inner = <Dishdasha fill="#eef0f2" />
      break
    case 'abaya':
      inner = <Abaya fill="#26262b" />
      break
    case 'dress':
      inner = <Dress fill="#8fa6c4" />
      break
    case 'shirt':
      inner = <Shirt fill="#dbe7f2" />
      break
    case 'trousers':
      inner = <Trousers fill="#3a4250" />
      break
    case 'ghutra':
      inner = <Ghutra fill="#f4f5f6" />
      break
    case 'bedsheet':
      inner = <Bedsheet fill="#e7eaee" />
      break
    case 'towel':
      inner = <Towel fill="#cfe0dd" />
      break
    case 'blanket':
      inner = <Blanket fill="#a8b7cc" />
      break
    default:
      inner = <Dishdasha fill="#eef0f2" />
  }
  return (
    <svg viewBox="0 0 200 210" className={className} role="img" aria-label={art}>
      {inner}
    </svg>
  )
}
