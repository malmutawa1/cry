import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useI18n } from '../i18n'
import { Close, Locate, Pin } from './Icons'

const KUWAIT = { lat: 29.3352, lng: 48.0189 }

interface Props {
  initialAddress?: string
  onClose: () => void
  onSelect: (address: string, coords: { lat: number; lng: number }) => void
}

export default function LocationPicker({ onClose, onSelect }: Props) {
  const { t } = useI18n()
  const mapEl = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const [coords, setCoords] = useState(KUWAIT)
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(true)

  function reverseGeocode(lat: number, lng: number) {
    setLoading(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(async () => {
      const ctrl = new AbortController()
      const to = window.setTimeout(() => ctrl.abort(), 6000)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          { headers: { Accept: 'application/json' }, signal: ctrl.signal },
        )
        const j = await res.json()
        const a = j.address || {}
        const parts = [
          [a.road, a.house_number].filter(Boolean).join(' '),
          a.neighbourhood || a.suburb || a.quarter,
          a.city || a.town || a.state,
          a.country,
        ].filter(Boolean)
        setAddress(parts.slice(0, 3).join(', ') || j.display_name || '')
      } catch {
        setAddress('')
      } finally {
        window.clearTimeout(to)
        setLoading(false)
      }
    }, 450)
  }

  useEffect(() => {
    if (!mapEl.current || mapRef.current) return
    const map = L.map(mapEl.current, {
      center: [KUWAIT.lat, KUWAIT.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: true,
    })
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 20,
      attribution: '&copy; OpenStreetMap &copy; CARTO',
    }).addTo(map)
    map.on('move', () => {
      const c = map.getCenter()
      setCoords({ lat: c.lat, lng: c.lng })
    })
    map.on('moveend', () => {
      const c = map.getCenter()
      reverseGeocode(c.lat, c.lng)
    })
    mapRef.current = map
    window.setTimeout(() => map.invalidateSize(), 120)
    reverseGeocode(KUWAIT.lat, KUWAIT.lng)
    return () => {
      window.clearTimeout(timer.current)
      map.remove()
      mapRef.current = null
    }
  }, [])

  function useCurrentLocation() {
    if (!navigator.geolocation) return
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => mapRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 17),
      () => setLoading(false),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  const coordStr = `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`

  return (
    <div className="locpicker">
      <div className="lp-map" ref={mapEl} />

      {/* fixed center pin */}
      <div className="lp-pin" aria-hidden>
        <svg width="40" height="52" viewBox="0 0 40 52">
          <path d="M20 2C11 2 4 9 4 18c0 11 16 30 16 30s16-19 16-30C36 9 29 2 20 2Z" fill="var(--accent)" stroke="#05243a" strokeWidth="1.5" />
          <circle cx="20" cy="18" r="6" fill="#05243a" />
        </svg>
        <span className="lp-pin-shadow" />
      </div>

      <div className="lp-top">
        <button className="round-btn" onClick={onClose} aria-label="Back"><Close /></button>
        <h1>{t('loc.title')}</h1>
        <span style={{ width: 42 }} />
      </div>

      <button className="lp-locate" onClick={useCurrentLocation} aria-label={t('loc.current')}>
        <Locate size={20} />
      </button>

      <div className="lp-panel">
        <div className="lp-addr">
          <span className="lp-ic"><Pin size={20} /></span>
          <span className="lp-addr-body">
            <span className="lp-addr-line">{loading ? t('loc.searching') : address || t('loc.dropped')}</span>
            <span className="lp-coords" dir="ltr">{coordStr}</span>
          </span>
        </div>
        <button
          className="btn-primary"
          onClick={() => onSelect(address || `${t('loc.dropped')} (${coordStr})`, coords)}
        >
          {t('loc.confirm')}
        </button>
      </div>
    </div>
  )
}
