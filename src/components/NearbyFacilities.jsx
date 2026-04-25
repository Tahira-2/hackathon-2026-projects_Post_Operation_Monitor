import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import styles from './NearbyFacilities.module.css'

const FACILITY_SEARCH = {
  emergency: { amenity: 'hospital', label: 'Emergency Rooms' },
  urgent: { amenity: 'clinic|doctors', label: 'Urgent Care Centers' },
  semi_urgent: { amenity: 'clinic|doctors', label: 'Medical Clinics' },
  non_urgent: { amenity: 'doctors', label: 'Primary Care Doctors' },
  self_care: { amenity: 'pharmacy', label: 'Pharmacies' },
}

const URGENCY_COLORS = {
  emergency: '#ef4444',
  urgent: '#f97316',
  semi_urgent: '#eab308',
  non_urgent: '#3b82f6',
  self_care: '#22c55e',
}

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1)
}

async function fetchNearbyFacilities(lat, lng, amenity) {
  const query = `
    [out:json][timeout:10];
    (
      node["amenity"~"${amenity}"](around:8000,${lat},${lng});
      way["amenity"~"${amenity}"](around:8000,${lat},${lng});
    );
    out center 5;
  `
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  })
  const data = await res.json()
  return data.elements.map(el => ({
    name: el.tags?.name || 'Unnamed Facility',
    address: [el.tags?.['addr:street'], el.tags?.['addr:city']].filter(Boolean).join(', ') || 'Address unavailable',
    lat: el.lat ?? el.center?.lat,
    lng: el.lon ?? el.center?.lon,
    phone: el.tags?.phone || null,
  })).filter(f => f.lat && f.lng)
}

export default function NearbyFacilities({ urgencyLevel }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [facilities, setFacilities] = useState([])
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const config = FACILITY_SEARCH[urgencyLevel] || FACILITY_SEARCH.non_urgent
  const accentColor = URGENCY_COLORS[urgencyLevel] || '#3b82f6'

  const findFacilities = () => {
    setStatus('locating')
    setFacilities([])

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setStatus('loading')
        const { latitude: lat, longitude: lng } = pos.coords

        try {
          const L = await import('leaflet')

          delete L.Icon.Default.prototype._getIconUrl
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          })

          if (mapInstanceRef.current) {
            mapInstanceRef.current.remove()
            mapInstanceRef.current = null
          }

          const map = L.map(mapRef.current).setView([lat, lng], 13)
          mapInstanceRef.current = map

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map)

          L.circleMarker([lat, lng], {
            radius: 8,
            fillColor: '#3b82f6',
            color: '#ffffff',
            weight: 2,
            fillOpacity: 1,
          }).addTo(map).bindPopup('Your Location')

          const results = await fetchNearbyFacilities(lat, lng, config.amenity)

          if (results.length === 0) {
            setErrorMsg('No facilities found nearby.')
            setStatus('error')
            return
          }

          const top = results
            .map(f => ({ ...f, distance: parseFloat(getDistance(lat, lng, f.lat, f.lng)) }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 3)

          top.forEach((f, i) => {
            const icon = L.divIcon({
              html: `<div style="background:${accentColor};color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:13px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${i + 1}</div>`,
              className: '',
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            })

            L.marker([f.lat, f.lng], { icon })
              .addTo(map)
              .bindPopup(`<strong>${f.name}</strong><br/>${f.address}`)
          })

          const bounds = L.latLngBounds([[lat, lng], ...top.map(f => [f.lat, f.lng])])
          map.fitBounds(bounds, { padding: [30, 30] })

          setFacilities(top)
          setStatus('done')
        } catch (err) {
          console.error(err)
          setErrorMsg('Failed to load map. Please try again.')
          setStatus('error')
        }
      },
      () => {
        setErrorMsg('Location access denied. Please enable location permissions.')
        setStatus('error')
      }
    )
  }

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.icon}>📍</span>
        <span className={styles.title}>Nearby {config.label}</span>
      </div>

      {status === 'idle' && (
        <button
          className={styles.findBtn}
          style={{ borderColor: accentColor, color: accentColor }}
          onClick={findFacilities}
        >
          Find Nearest {config.label}
        </button>
      )}

      {(status === 'locating' || status === 'loading') && (
        <div className={styles.loadingRow}>
          <div className={styles.spinner} style={{ borderTopColor: accentColor }} />
          <span>{status === 'locating' ? 'Getting your location...' : 'Searching nearby facilities...'}</span>
        </div>
      )}

      {status === 'error' && (
        <div className={styles.error}>
          <span>⚠️ {errorMsg}</span>
          <button className={styles.retryBtn} onClick={findFacilities}>Try Again</button>
        </div>
      )}

      <div
        ref={mapRef}
        className={styles.map}
        style={{ display: status === 'done' ? 'block' : 'none' }}
      />

      {status === 'done' && facilities.length > 0 && (
        <div className={styles.list}>
          {facilities.map((f, i) => (
            <a
              key={i}
              href={`https://www.openstreetmap.org/?mlat=${f.lat}&mlon=${f.lng}&zoom=16`}
              target="_blank"
              rel="noreferrer"
              className={styles.facilityItem}
            >
              <div className={styles.facilityNumber} style={{ background: accentColor }}>
                {i + 1}
              </div>
              <div className={styles.facilityInfo}>
                <div className={styles.facilityName}>{f.name}</div>
                <div className={styles.facilityMeta}>
                  <span>{f.address}</span>
                  {f.phone && <span>📞 {f.phone}</span>}
                </div>
              </div>
              <div className={styles.facilityDistance}>{f.distance} mi</div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
