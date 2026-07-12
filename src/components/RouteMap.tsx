import { useI18n } from '../i18n'

// Fixed geo points (plausible Kuwait coordinates) for the facility and the home.
const STORE_GEO = { lat: 29.376, lng: 47.9772 }
const HOME_GEO = { lat: 29.3352, lng: 48.0189 }

// SVG anchor points for the same two locations, plus a control point for a curved road.
const S = { x: 58, y: 66 }
const C = { x: 168, y: 34 }
const H = { x: 300, y: 176 }

// Driver progress along store→home (0..1) at the start/end of each stage.
const START_F = [0.05, 0.12, 1.0, 0.0, 0.05, 1.0]
const END_F = [0.12, 1.0, 0.05, 0.0, 1.0, 1.0]

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
function bezier(t: number) {
  const mt = 1 - t
  return {
    x: mt * mt * S.x + 2 * mt * t * C.x + t * t * H.x,
    y: mt * mt * S.y + 2 * mt * t * C.y + t * t * H.y,
  }
}

function Pin({ x, y, color, children }: { x: number; y: number; color: string; children: React.ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0 C -8 -11 -8 -21 0 -21 C 8 -21 8 -11 0 0 Z" fill={color} stroke="rgba(0,0,0,.35)" strokeWidth="1" />
      <circle cx="0" cy="-13" r="7.5" fill="rgba(0,0,0,.18)" />
      <svg x="-7" y="-20" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </g>
  )
}

export default function RouteMap({ stage, frac }: { stage: number; frac: number }) {
  const { t } = useI18n()
  const f = lerp(START_F[stage] ?? 0, END_F[stage] ?? 0, Math.max(0, Math.min(1, frac)))
  const d = bezier(f)
  const driverGeo = { lat: lerp(STORE_GEO.lat, HOME_GEO.lat, f), lng: lerp(STORE_GEO.lng, HOME_GEO.lng, f) }
  const fmt = (g: { lat: number; lng: number }) => `${g.lat.toFixed(4)}°N, ${g.lng.toFixed(4)}°E`

  return (
    <div className="map-card">
      <svg viewBox="0 0 360 220" className="map-svg" preserveAspectRatio="xMidYMid slice">
        <rect x="0" y="0" width="360" height="220" fill="#0e1620" />
        {/* faint street grid */}
        <g stroke="#1b2836" strokeWidth="10">
          <path d="M-10 60 H370M-10 150 H370M70 -10 V230M210 -10 V230M300 -10 V230" />
        </g>
        <g stroke="#16212d" strokeWidth="3">
          <path d="M-10 105 H370M140 -10 V230" />
        </g>
        <rect x="90" y="72" width="46" height="34" rx="4" fill="#15202c" />
        <rect x="228" y="100" width="52" height="40" rx="4" fill="#15202c" />
        <rect x="120" y="158" width="60" height="34" rx="4" fill="#15202c" />

        {/* route */}
        <path
          d={`M${S.x} ${S.y} Q ${C.x} ${C.y} ${H.x} ${H.y}`}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="2 10"
          opacity="0.85"
        />

        <Pin x={S.x} y={S.y} color="#34c759">
          <path d="M4 9 5 4h14l1 5M4 9h16M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M9 20v-5h6v5" />
        </Pin>
        <Pin x={H.x} y={H.y} color="#c9a24a">
          <path d="M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
        </Pin>

        {/* driver (live) */}
        <g transform={`translate(${d.x} ${d.y})`}>
          <circle r="16" fill="var(--accent)" opacity="0.18" className="map-pulse" />
          <circle r="12" fill="var(--accent)" stroke="#0e1620" strokeWidth="2.5" />
          <svg x="-8" y="-8" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 11l1.3-3.5A1.6 1.6 0 0 1 7.8 6.5h8.4a1.6 1.6 0 0 1 1.5 1L19 11M4.5 11h15a1 1 0 0 1 1 1v3.5a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V12a1 1 0 0 1 1-1ZM8 18a1.5 1.5 0 0 0 0-3 1.5 1.5 0 0 0 0 3ZM16 18a1.5 1.5 0 0 0 0-3 1.5 1.5 0 0 0 0 3Z" />
          </svg>
        </g>
      </svg>

      <div className="map-legend">
        <div className="ml-row">
          <span className="ml-dot" style={{ background: 'var(--accent)' }} />
          <span className="ml-name">{t('map.driver')}<span className="ml-live">{t('track.live')}</span></span>
          <span className="ml-geo">{fmt(driverGeo)}</span>
        </div>
        <div className="ml-row">
          <span className="ml-dot" style={{ background: '#34c759' }} />
          <span className="ml-name">{t('map.store')}</span>
          <span className="ml-geo">{fmt(STORE_GEO)}</span>
        </div>
        <div className="ml-row">
          <span className="ml-dot" style={{ background: '#c9a24a' }} />
          <span className="ml-name">{t('map.home')}</span>
          <span className="ml-geo">{fmt(HOME_GEO)}</span>
        </div>
      </div>
    </div>
  )
}
