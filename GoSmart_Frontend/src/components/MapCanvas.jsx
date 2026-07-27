import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { useTheme } from "../context/ThemeContext";
import { busLines, busRoute, routeColor, routeLabel, relativeTime } from "../utils/route";

const KIMIRONKO_CENTER = [-1.9506, 30.1213];


/*
 * The design brief asks for a simplified vector basemap — white roads, grey
 * land, no satellite or terrain — so GoSmart uses CARTO's Positron/Dark Matter
 * tiles instead of standard OSM raster tiles. Both are key-free.
 */
const TILES = {
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
};
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

function busIcon({ color, label, live, selected }) {
  const w = selected ? 40 : 34;
  const h = selected ? 24 : 20;
  const ring = selected
    ? `<span style="position:absolute;inset:-9px;border-radius:14px;background:${color};opacity:0.18;"></span>`
    : "";
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:${w}px;height:${h}px;">
      ${ring}
      <div class="bus-marker" style="position:relative;width:${w}px;height:${h}px;background:${color};
        opacity:${live ? 1 : 0.45};font-size:${selected ? 10 : 9}px;">${label}</div>
    </div>`,
    iconSize: [w, h],
    iconAnchor: [w / 2, h / 2],
    popupAnchor: [0, -h / 2 - 4],
  });
}

function stopIcon({ color, highlighted, terminal }) {
  const size = highlighted ? 18 : terminal ? 14 : 11;
  const stroke = highlighted ? 3 : terminal ? 2.5 : 2;
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:#ffffff;border:${stroke}px solid ${highlighted ? "#d97706" : color};
      box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 2],
  });
}

function FitBounds({ points, enabled }) {
  const map = useMap();
  const key = JSON.stringify(points);
  useEffect(() => {
    if (!enabled || !points || points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 15, { animate: true });
      return;
    }
    map.fitBounds(points, { padding: [50, 50], maxZoom: 16 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, map]);
  return null;
}

/** The map lives inside flex containers that resize; Leaflet needs a nudge. */
function ResizeFix() {
  const map = useMap();
  useEffect(() => {
    const invalidate = () => map.invalidateSize();
    const t = setTimeout(invalidate, 120);
    window.addEventListener("resize", invalidate);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", invalidate);
    };
  }, [map]);
  return null;
}

/** Index of the polyline vertex a bus has most recently passed. */
function travelledIndex(polyline, busPoint) {
  if (!polyline || polyline.length < 2 || !busPoint) return -1;
  let best = -1;
  let bestDist = Infinity;
  polyline.forEach(([lat, lng], i) => {
    const d = (lat - busPoint[0]) ** 2 + (lng - busPoint[1]) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  });
  return best;
}

export default function MapCanvas({
  buses = [],
  stops = [],
  polyline = null,
  height = 420,
  fill = false,
  fitToMarkers = true,
  selectedBusId = null,
  onSelectBus = null,
  lineColor = null,
  showProgress = false,
  interactive = true,
}) {
  const { dark } = useTheme();

  const points = useMemo(
    () => [
      ...buses.filter((b) => b.current_lat != null).map((b) => [Number(b.current_lat), Number(b.current_lng)]),
      ...stops.map((s) => [Number(s.latitude), Number(s.longitude)]),
    ],
    [buses, stops]
  );

  const color = lineColor || "#16a34a";

  /* Split the route line at the bus: travelled behind (dashed), ahead solid —
     the "how far has my bus got" cue from the design brief. */
  const leadBus = buses.find((b) => b.current_lat != null);
  const leadPoint = leadBus ? [Number(leadBus.current_lat), Number(leadBus.current_lng)] : null;
  const splitAt = showProgress ? travelledIndex(polyline, leadPoint) : -1;
  const travelled = splitAt > 0 ? [...polyline.slice(0, splitAt + 1), leadPoint] : null;
  const ahead = splitAt > 0 ? [leadPoint, ...polyline.slice(splitAt + 1)] : polyline;

  const style = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }
    : { height, width: "100%", borderRadius: "var(--r-lg)", zIndex: 0 };

  return (
    <MapContainer
      center={KIMIRONKO_CENTER}
      zoom={14}
      scrollWheelZoom={interactive}
      dragging={interactive}
      zoomControl={false}
      attributionControl
      style={style}
    >
      <TileLayer attribution={TILE_ATTRIBUTION} url={dark ? TILES.dark : TILES.light} subdomains="abcd" maxZoom={20} />

      <ResizeFix />

      {travelled && travelled.length > 1 && (
        <Polyline positions={travelled} pathOptions={{ color, weight: 5, opacity: 0.4, dashArray: "9 8", lineCap: "round" }} />
      )}
      {ahead && ahead.length > 1 && (
        <Polyline positions={ahead} pathOptions={{ color, weight: 5.5, opacity: 0.9, lineCap: "round", lineJoin: "round" }} />
      )}

      {stops.map((s, i) => (
        <Marker
          key={`stop-${s.id ?? i}`}
          position={[Number(s.latitude), Number(s.longitude)]}
          icon={stopIcon({
            color,
            highlighted: s.highlighted,
            terminal: i === 0 || i === stops.length - 1,
          })}
        >
          <Popup>
            <strong>{s.stop_name}</strong>
            {s.stop_order != null && <div style={{ color: "var(--muted)" }}>Stop #{s.stop_order}</div>}
          </Popup>
        </Marker>
      ))}

      {buses
        .filter((b) => b.current_lat != null && b.current_lng != null)
        .map((b) => {
          const c = b.route != null ? routeColor(b.route) : "#71717a";
          const selected = String(b.id) === String(selectedBusId);
          return (
            <Marker
              key={`bus-${b.id}`}
              position={[Number(b.current_lat), Number(b.current_lng)]}
              zIndexOffset={selected ? 1000 : 0}
              icon={busIcon({
                color: c,
                label: b.route_name ? routeLabel(busRoute(b)) : "··",
                live: b.is_live,
                selected,
              })}
              eventHandlers={onSelectBus ? { click: () => onSelectBus(b) } : undefined}
            >
              <Popup>
                <strong>{busLines(b).title}</strong>
                <div style={{ color: "var(--muted)" }}>{busLines(b).sub}</div>
                <div style={{ color: b.is_live ? "var(--brand)" : "var(--muted)", fontWeight: 600 }}>
                  {b.is_live ? "Live now" : `Offline · ${relativeTime(b.last_updated)}`}
                </div>
              </Popup>
            </Marker>
          );
        })}

      <FitBounds points={points} enabled={fitToMarkers} />
    </MapContainer>
  );
}
