"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type { Doctor } from "@/lib/api";

// ---------------------------------------------------------------------------
// Specialty → accent colour (stays close to careIT MD3 palette)
// ---------------------------------------------------------------------------
const SPECIALTY_COLOR: Record<string, string> = {
  "Cardiology":        "#ba1a1a",
  "Neurology":         "#5b4fa8",
  "Dermatology":       "#006876",
  "Psychiatry":        "#7c4dff",
  "Orthopedics":       "#c95d00",
  "Gastroenterology":  "#2e7d32",
  "ENT":               "#0277bd",
  "Oncology":          "#ad1457",
  "Endocrinology":     "#00695c",
  "Pulmonology":       "#1565c0",
  "Rheumatology":      "#558b2f",
  "Ophthalmology":     "#00838f",
  "Urology":           "#6d4c41",
  "Gynecology":        "#e91e63",
  "Pediatrics":        "#f57c00",
  "General Practice":  "#00342b",
};

const DEFAULT_COLOR = "#00342b";

function colorFor(specialty: string) {
  return SPECIALTY_COLOR[specialty] ?? DEFAULT_COLOR;
}

// Deterministic sub-degree jitter so doctors sharing the same address don't overlap
function jitterFor(id: string): [number, number] {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const dlat = ((h & 0xff) / 255 - 0.5) * 0.006;
  const dlng = (((h >> 8) & 0xff) / 255 - 0.5) * 0.006;
  return [dlat, dlng];
}

function youAreHereHtml() {
  return `
    <div style="position:relative;width:20px;height:20px">
      <div style="
        width:14px;height:14px;
        background:#1976d2;
        border:3px solid #fff;
        border-radius:50%;
        position:absolute;
        top:3px;left:3px;
        z-index:1;
        box-shadow:0 2px 8px rgba(25,118,210,.5)
      "></div>
      <div style="
        position:absolute;inset:0;
        border-radius:50%;
        border:2px solid #1976d2;
        opacity:.45;
        animation:careit-pulse 2s ease-out infinite
      "></div>
    </div>`;
}

function pinHtml(color: string) {
  return `
    <div style="position:relative;width:36px;height:36px">
      <div style="
        width:36px;height:36px;
        background:${color};
        border:3px solid #fff;
        border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 4px 14px rgba(0,0,0,.22);
        position:relative;z-index:1
      ">
        <span class="material-symbols-outlined"
          style="color:#fff;font-size:16px;font-variation-settings:'FILL' 1">
          stethoscope
        </span>
      </div>
      <div style="
        position:absolute;inset:-5px;
        border-radius:50%;
        border:2px solid ${color};
        opacity:.5;
        animation:careit-pulse 2s ease-out infinite
      "></div>
    </div>`;
}

function popupHtml(doc: Doctor, color: string) {
  const stars  = Math.round(doc.rating);
  const filled = "★".repeat(stars);
  const empty  = "☆".repeat(5 - stars);
  return `
    <div style="font-family:Manrope,system-ui,sans-serif;padding:2px;min-width:210px">
      <p style="font-size:14px;font-weight:800;color:#00342b;margin:0 0 2px;line-height:1.3">
        ${doc.name}
      </p>
      <p style="font-size:11px;font-weight:700;color:${color};margin:0 0 5px;letter-spacing:.04em;text-transform:uppercase">
        ${doc.specialty}
      </p>
      <p style="font-size:11px;color:#707975;margin:0 0 8px;line-height:1.5">
        ${doc.location}
      </p>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <span style="color:#f59e0b;font-size:13px">${filled}${empty}</span>
        <span style="font-size:11px;color:#707975;font-weight:600">
          ${doc.rating.toFixed(1)} · ${doc.review_count} reviews
        </span>
      </div>
      <button
        id="careit-book-${doc.id}"
        style="
          width:100%;background:#00342b;color:#fff;
          border:none;border-radius:12px;
          padding:9px 0;font-size:13px;font-weight:700;
          cursor:pointer;font-family:inherit;
          transition:background .15s
        "
        onmouseover="this.style.background='#004d40'"
        onmouseout="this.style.background='#00342b'"
      >Book Appointment</button>
    </div>`;
}

// Inject the pulse keyframe and Leaflet popup overrides once per page load
function ensureStyles() {
  if (document.getElementById("careit-map-css")) return;
  const el = document.createElement("style");
  el.id = "careit-map-css";
  el.textContent = `
    @keyframes careit-pulse {
      0%   { transform:scale(1);   opacity:.5 }
      70%  { transform:scale(2.4); opacity:0  }
      100% { transform:scale(2.4); opacity:0  }
    }
    .leaflet-popup-content-wrapper {
      border-radius: 18px !important;
      box-shadow: 0 8px 32px rgba(0,52,43,.18) !important;
      border: 1px solid rgba(255,255,255,.3) !important;
      backdrop-filter: blur(12px) !important;
    }
    .leaflet-popup-tip { display:none !important; }
    .leaflet-popup-close-button {
      top:8px !important; right:10px !important;
      font-size:18px !important;
      color:#707975 !important;
    }
    .leaflet-control-zoom a {
      border-radius: 10px !important;
      font-size: 16px !important;
    }
    .leaflet-control-attribution {
      font-size: 9px !important;
      background: rgba(255,255,255,.6) !important;
      backdrop-filter: blur(6px) !important;
      border-radius: 8px 0 0 0 !important;
    }
  `;
  document.head.appendChild(el);
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  doctors: Doctor[];
  onBook:  (doc: Doctor) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DoctorMap({ doctors, onBook }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<any>(null);       // L.Map
  const layerGroupRef = useRef<any>(null);       // L.LayerGroup
  const lRef          = useRef<any>(null);       // Leaflet module
  const onBookRef     = useRef(onBook);
  const [mapReady, setMapReady] = useState(false);

  // Keep callback ref current without triggering effects
  useEffect(() => { onBookRef.current = onBook; }, [onBook]);

  // ── Effect 1: initialise map once ──────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let mounted = true;

    (async () => {
      const L = (await import("leaflet")).default;
      if (!mounted || !containerRef.current || mapRef.current) return;

      ensureStyles();

      const map = L.map(containerRef.current, {
        center:          [39.5, -98.35],
        zoom:            4,
        zoomControl:     false,
        scrollWheelZoom: true,
        attributionControl: true,
      });

      // Clean CartoDB Positron tiles — no API key required
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          subdomains:  "abcd",
          maxZoom:     19,
          attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> © <a href="https://carto.com">CARTO</a>',
        }
      ).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);

      lRef.current          = L;
      mapRef.current        = map;
      layerGroupRef.current = layerGroup;

      setMapReady(true);

      // Request geolocation and add "You are here" marker
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (!mounted || !mapRef.current) return;
            const { latitude: lat, longitude: lng } = pos.coords;
            const youIcon = L.divIcon({
              className:   "",
              html:        youAreHereHtml(),
              iconSize:    [20, 20],
              iconAnchor:  [10, 10],
              popupAnchor: [0, -14],
            });
            L.marker([lat, lng], { icon: youIcon, zIndexOffset: 1000 })
              .bindPopup(
                `<div style="font-family:Manrope,system-ui,sans-serif;padding:2px;font-size:13px;font-weight:700;color:#1976d2">
                   📍 You are here
                 </div>`
              )
              .addTo(mapRef.current);
            mapRef.current.flyTo([lat, lng], 10, { duration: 1.8 });
          },
          () => {} // silently ignore if denied
        );
      }
    })();

    return () => {
      mounted = false;
      mapRef.current?.remove();
      mapRef.current        = null;
      layerGroupRef.current = null;
      lRef.current          = null;
    };
  }, []);

  // ── Effect 2: rebuild markers whenever doctors list changes ────────────
  useEffect(() => {
    const L     = lRef.current;
    const group = layerGroupRef.current;
    if (!mapReady || !L || !group) return;

    group.clearLayers();

    doctors.forEach((doc) => {
      if (doc.lat == null || doc.lng == null) return;

      const color = colorFor(doc.specialty);
      const [dlat, dlng] = jitterFor(doc.id);

      const icon = L.divIcon({
        className:   "",
        html:        pinHtml(color),
        iconSize:    [36, 36],
        iconAnchor:  [18, 18],
        popupAnchor: [0, -22],
      });

      const marker = L.marker([doc.lat + dlat, doc.lng + dlng], { icon });

      marker.bindPopup(
        L.popup({ maxWidth: 260, minWidth: 230, closeButton: true })
          .setContent(popupHtml(doc, color))
      );

      marker.on("popupopen", () => {
        // Wire the Book button inside the popup DOM
        setTimeout(() => {
          const btn = document.getElementById(`careit-book-${doc.id}`);
          if (btn) btn.onclick = () => onBookRef.current(doc);
        }, 30);
      });

      marker.addTo(group);
    });
  }, [mapReady, doctors]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl overflow-hidden"
      style={{ height: "540px" }}
    />
  );
}
