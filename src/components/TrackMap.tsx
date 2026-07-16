import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useI18n } from '../i18n'

// Fixed geo points (plausible Kuwait coordinates) for the facility and the home.
const STORE_GEO = { lat: 29.376, lng: 47.9772 }
const HOME_GEO = { lat: 29.3352, lng: 48.0189 }

// Driver progress along store→home (0..1) at the start/end of each stage.
const START_F = [0.05, 0.12, 1.0, 0.0, 0.05, 1.0]
const END_F = [0.12, 1.0, 0.05, 0.0, 1.0, 1.0]
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function pinIcon(color: string, glyph: string): L.DivIcon {
  return L.divIcon({
    className: 'tm-pin-wrap',
    html: `<span class="tm-pin" style="--pin:${color}">
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${glyph}</svg>
    </span>`,
    iconSize: [30, 38],
    iconAnchor: [15, 36],
  })
}

const STORE_ICON = pinIcon('#34c759', '<path d="M4 9 5 4h14l1 5M4 9h16M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M9 20v-5h6v5"/>')
const HOME_ICON = pinIcon('#c9a24a', '<path d="M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/>')
const DRIVER_ICON = L.divIcon({
  className: 'tm-driver-wrap',
  html: `<span class="tm-driver"><span class="tm-driver-pulse"></span>
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 11l1.3-3.5A1.6 1.6 0 0 1 7.8 6.5h8.4a1.6 1.6 0 0 1 1.5 1L19 11M4.5 11h15a1 1 0 0 1 1 1v3.5a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V12a1 1 0 0 1 1-1ZM8 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM16 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/>
    </svg></span>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
})

/** Live delivery map: real tiles (CARTO Voyager), facility→home route, moving driver. */
export default function TrackMap({ stage, frac }: { stage: number; frac: number }) {
  const { t } = useI18n()
  const mapEl = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const driverRef = useRef<L.Marker | null>(null)
  const routeRef = useRef<L.Polyline | null>(null)

  useEffect(() => {
    if (!mapEl.current || mapRef.current) return
    const map = L.map(mapEl.current, {
      center: [(STORE_GEO.lat + HOME_GEO.lat) / 2, (STORE_GEO.lng + HOME_GEO.lng) / 2],
      zoom: 13,
      // A clean, non-interactive backdrop so the page still scrolls over it.
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false,
      zoomControl: false,
      attributionControl: false,
    })
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map)

    L.marker([STORE_GEO.lat, STORE_GEO.lng], { icon: STORE_ICON, keyboard: false }).addTo(map)
    L.marker([HOME_GEO.lat, HOME_GEO.lng], { icon: HOME_ICON, keyboard: false }).addTo(map)
    routeRef.current = L.polyline(
      [
        [STORE_GEO.lat, STORE_GEO.lng],
        [HOME_GEO.lat, HOME_GEO.lng],
      ],
      { color: '#4cc4ff', weight: 4, opacity: 0.9, dashArray: '2 9', lineCap: 'round' },
    ).addTo(map)
    driverRef.current = L.marker([STORE_GEO.lat, STORE_GEO.lng], { icon: DRIVER_ICON, zIndexOffset: 1000, keyboard: false }).addTo(map)

    map.fitBounds(
      [
        [STORE_GEO.lat, STORE_GEO.lng],
        [HOME_GEO.lat, HOME_GEO.lng],
      ],
      { padding: [46, 46] },
    )
    mapRef.current = map
    window.setTimeout(() => map.invalidateSize(), 120)
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Move the driver marker along the route as the stage/fraction advance.
  useEffect(() => {
    const f = lerp(START_F[stage] ?? 0, END_F[stage] ?? 0, Math.max(0, Math.min(1, frac)))
    const lat = lerp(STORE_GEO.lat, HOME_GEO.lat, f)
    const lng = lerp(STORE_GEO.lng, HOME_GEO.lng, f)
    driverRef.current?.setLatLng([lat, lng])
  }, [stage, frac])

  return (
    <div className="track-map">
      <div ref={mapEl} className="track-map-canvas" />
      <span className="tm-live">
        <span className="tm-live-dot" />
        {t('track.live')}
      </span>
    </div>
  )
}
