import type { Garment } from '../data/garments'

/** Drawn line-icons for garments (no emoji). One recognizable shape per
 *  garment type; every catalogue item resolves to one of these. */

type IconType =
  | 'thobe' | 'abaya' | 'bisht' | 'ghutra' | 'scarf' | 'cap' | 'egal'
  | 'dress' | 'shirt' | 'trousers' | 'shorts' | 'jacket' | 'socks' | 'gloves'
  | 'tie' | 'belt' | 'towel' | 'curtain' | 'bed' | 'cushion' | 'rug' | 'hanger'

function typeOf(g: Garment): IconType {
  const n = g.name.toLowerCase()
  const has = (...w: string[]) => w.some((x) => n.includes(x))
  if (has('abaya')) return 'abaya'
  if (has('bisht', 'farwa')) return 'bisht'
  if (has('dishdasha', 'thob', 'jalabiya', 'daraa', 'kaftan', 'deebaj', 'robe', 'bathrobe', 'ihram')) return 'thobe'
  if (has('ghutra', 'shemagh', 'milfa', 'boshiya', 'bukhnaq')) return 'ghutra'
  if (has('scarf', 'shawl', 'shayla', 'hijab', 'kufiya', 'esharb')) return 'scarf'
  if (has('taqiyah', 'cap', 'hat')) return 'cap'
  if (has('egal', 'agal')) return 'egal'
  if (has('necktie', 'tie')) return 'tie'
  if (has('belt')) return 'belt'
  if (has('sock')) return 'socks'
  if (has('glove')) return 'gloves'
  if (has('curtain')) return 'curtain'
  if (has('towel', 'bath', 'tablecloth', 'napkin', 'placemat', 'runner', 'apron', 'kitchen')) return 'towel'
  if (has('sofa', 'couch', 'cushion')) return 'cushion'
  if (has('rug', 'prayer', 'jalsa', 'floor', 'bath mat')) return 'rug'
  if (has('sheet', 'blanket', 'pillow', 'duvet', 'comforter', 'bedding', 'bolster', 'shozat', 'coverlet', 'quilt', 'bed', 'linen')) return 'bed'
  if (has('dress', 'maxi', 'gown', 'nightgown', 'jumpsuit', 'overall')) return 'dress'
  if (has('shorts', 'bermuda', 'swim', 'underwear')) return 'shorts'
  if (has('trousers', 'jeans', 'chinos', 'pants', 'leggings', 'wizar')) return 'trousers'
  if (has('jacket', 'blazer', 'coat', 'cardigan', 'hoodie', 'pullover', 'sweater', 'suit', 'tracksuit', 'vest', 'gilet', 'sidairi', 'uniform', 'military')) return 'jacket'
  if (has('shirt', 't-shirt', 'polo', 'blouse', 'tunic', 'jersey', 'undershirt', 'fanila', 'pyjama', 'pajama', 'bib', 'newborn', 'swaddle', 'baby', 'clothing', 'school')) return 'shirt'
  if (has('silk', 'velvet', 'cashmere', 'fur', 'leather', 'suede', 'lace', 'chiffon', 'beaded', 'sequined', 'embroidered')) return 'dress'
  return 'hanger'
}

function paths(type: IconType) {
  switch (type) {
    case 'thobe': // long men's robe
      return (
        <>
          <path d="M8.5 3.5 11 5.4 12 6.2 13 5.4 15.5 3.5 18.6 6.6 16.9 8.4 16.4 20.5 7.6 20.5 7.1 8.4 5.4 6.6Z" />
          <path d="M12 6.2V20.5" />
        </>
      )
    case 'abaya': // flowing open cloak
      return (
        <>
          <path d="M8 4C6.4 5 6 6.6 6 8L7.4 8.7 7.4 20.5 16.6 20.5 16.6 8.7 18 8C18 6.6 17.6 5 16 4" />
          <path d="M9.4 4Q12 6.6 14.6 4" />
          <path d="M12 5V20.5" />
        </>
      )
    case 'bisht': // wide cloak with shoulder trim
      return (
        <>
          <path d="M4.5 6.5 9 4.5 12 6.3 15 4.5 19.5 6.5 17.7 9 17.7 20.5 6.3 20.5 6.3 9Z" />
          <path d="M12 6.3V20.5" />
          <path d="M9 4.5 7.6 20.5M15 4.5 16.4 20.5" />
        </>
      )
    case 'ghutra': // draped head cloth
      return (
        <>
          <path d="M6.4 8Q12 2.6 17.6 8L18.6 17.5Q12 14.8 5.4 17.5Z" />
          <path d="M12 4.4V13.5" />
        </>
      )
    case 'scarf': // long scarf with hanging ends
      return (
        <>
          <path d="M6 4.5Q12 8.6 18 4.5L18 8Q12 12 6 8Z" />
          <path d="M8.6 8 7.6 20M15.4 8 16.4 20" />
        </>
      )
    case 'cap': // skull cap / dome
      return (
        <>
          <path d="M5 14.8Q5 6.4 12 6.4 19 6.4 19 14.8" />
          <path d="M4 14.8H20" />
        </>
      )
    case 'egal': // coiled black cord
      return (
        <>
          <ellipse cx="12" cy="11" rx="7.4" ry="4.6" />
          <ellipse cx="12" cy="13.2" rx="7.4" ry="4.6" />
        </>
      )
    case 'dress': // A-line dress
      return <path d="M9 4 11 5.6 12 6.2 13 5.6 15 4 17 8.2 15.2 9.2 18 20.5 6 20.5 8.8 9.2 7 8.2Z" />
    case 'shirt': // t-shirt
      return <path d="M8.5 4 5.5 7 7.3 9 7.7 20.5 16.3 20.5 16.7 9 18.5 7 15.5 4 13.4 6.1Q12 7 10.6 6.1Z" />
    case 'trousers':
      return (
        <>
          <path d="M7.5 3.6H16.5L15.7 20.5H12.8L12 10 11.2 20.5H8.3Z" />
          <path d="M7.5 3.6H16.5" />
        </>
      )
    case 'shorts':
      return <path d="M7.5 5H16.5L15.9 14H13.1L12 9.5 10.9 14H8.1Z" />
    case 'jacket': // open-front jacket
      return (
        <>
          <path d="M8.5 4 5.5 7 7.3 9 7.3 20.5 16.7 20.5 16.7 9 18.5 7 15.5 4 12 7Z" />
          <path d="M12 7V20.5" />
        </>
      )
    case 'socks':
      return <path d="M10 3.6H14V12L17 15.6Q18.2 17.2 16.5 18.6L14.4 20.1Q12.5 21.1 11 19.4L9 17.4Q7.7 15.8 9.4 14.4L10 13.9Z" />
    case 'gloves': // mitten
      return (
        <>
          <path d="M8 20.5V12Q8 10 10 10H14Q16 10 16 12V20.5" />
          <path d="M16 13Q18.2 12 18.2 14.2 18.2 16.3 16 16.3" />
        </>
      )
    case 'tie': // necktie
      return (
        <>
          <path d="M10.4 4H13.6L14.6 7.2 12 20.5 9.4 7.2Z" />
          <path d="M10.4 4 12 6 13.6 4" />
        </>
      )
    case 'belt':
      return (
        <>
          <rect x="3.5" y="9.4" width="17" height="5.2" rx="1.2" />
          <rect x="10.8" y="9.4" width="4.2" height="5.2" rx="0.6" />
          <path d="M13 12H15" />
        </>
      )
    case 'towel': // hanging cloth
      return (
        <>
          <rect x="6.5" y="4" width="11" height="16" rx="1.4" />
          <path d="M6.5 8H17.5" />
        </>
      )
    case 'curtain':
      return (
        <>
          <path d="M4.5 4H19.5" />
          <path d="M6.6 4Q5.9 12 6.6 20M10 4Q9.3 12 10 20M14 4Q13.3 12 14 20M17.4 4Q16.7 12 17.4 20" />
        </>
      )
    case 'bed':
      return (
        <>
          <path d="M3.5 11V18.5M20.5 11V18.5M3.5 18.5H20.5M3.5 14H20.5" />
          <path d="M6 11V8.4Q6 7.8 6.6 7.8H11.4Q12 7.8 12 8.4V11" />
        </>
      )
    case 'cushion':
      return (
        <>
          <rect x="5" y="7.5" width="14" height="9" rx="2.6" />
          <path d="M7 9.4Q8.6 8.8 7.9 10.8M17 9.4Q15.4 8.8 16.1 10.8M7 14.6Q8.6 15.2 7.9 13.2M17 14.6Q15.4 15.2 16.1 13.2" />
        </>
      )
    case 'rug':
      return (
        <>
          <rect x="4.5" y="7" width="15" height="10" rx="1" />
          <rect x="7" y="9.4" width="10" height="5.2" rx="0.6" />
          <path d="M4.5 7V5.4M9 7V5.4M12 7V5.4M15 7V5.4M19.5 7V5.4M4.5 17V18.6M9 17V18.6M12 17V18.6M15 17V18.6M19.5 17V18.6" />
        </>
      )
    case 'hanger':
    default:
      return (
        <>
          <path d="M12 4.5A1.9 1.9 0 1 1 13.4 7.6" />
          <path d="M13 6.8 12 8.6 4.3 14.2Q3.2 15.2 4.5 15.8H19.5Q20.8 15.2 19.7 14.2Z" />
        </>
      )
  }
}

export default function GarmentIcon({ g, size = 26 }: { g: Garment; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths(typeOf(g))}
    </svg>
  )
}
