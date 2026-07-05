import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

const KIMIRONKO_CENTER = [-1.9506, 30.1213];

function busIcon(live) {
  const color = live ? "#2e9e4f" : "#9aa5b1";
  return L.divIcon({
    className: "",
    html: `<div style="
      width:26px;height:26px;border-radius:50%;
      background:${color};border:3px solid #ffffff;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
      display:flex;align-items:center;justify-content:center;
      font-size:13px;">🚌</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });
}

function stopIcon(highlighted) {
  const color = highlighted ? "#f0a500" : "#1565c0";
  const size = highlighted ? 16 : 12;
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:2px solid #ffffff;
      box-shadow:0 1px 4px rgba(0,0,0,0.35);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size],
  });
}

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 15, { animate: true });
      return;
    }
    map.fitBounds(points, { padding: [40, 40] });
  }, [JSON.stringify(points), map]);
  return null;
}

export default function MapCanvas({
  buses = [],
  stops = [],
  height = 420,
  fitToMarkers = true,
  polyline = null,
}) {
  const points = [
    ...buses.filter((b) => b.current_lat != null).map((b) => [Number(b.current_lat), Number(b.current_lng)]),
    ...stops.map((s) => [Number(s.latitude), Number(s.longitude)]),
  ];

  return (
    <MapContainer
      center={KIMIRONKO_CENTER}
      zoom={14}
      scrollWheelZoom
      style={{ height, width: "100%", borderRadius: "14px", zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {polyline && polyline.length > 1 && (
        <Polyline positions={polyline} pathOptions={{ color: "#1565c0", weight: 4, opacity: 0.65 }} />
      )}

      {stops.map((s) => (
        <Marker key={`stop-${s.id}`} position={[Number(s.latitude), Number(s.longitude)]} icon={stopIcon(s.highlighted)}>
          <Popup>
            <strong>{s.stop_name}</strong>
            {s.stop_order != null && <div>Stop #{s.stop_order}</div>}
          </Popup>
        </Marker>
      ))}

      {buses
        .filter((b) => b.current_lat != null && b.current_lng != null)
        .map((b) => (
          <Marker key={`bus-${b.id}`} position={[Number(b.current_lat), Number(b.current_lng)]} icon={busIcon(b.is_live)}>
            <Popup>
              <strong>{b.plate_no}</strong>
              <div>{b.route_name || "Unassigned route"}</div>
              <div>{b.is_live ? "Live now" : "Signal stale/offline"}</div>
            </Popup>
          </Marker>
        ))}

      {fitToMarkers && points.length > 0 && <FitBounds points={points} />}
    </MapContainer>
  );
}
