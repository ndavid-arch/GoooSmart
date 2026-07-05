import { useParams, Link } from "react-router-dom";
import MapCanvas from "../components/MapCanvas";
import Loading, { EmptyState } from "../components/Loading";
import { LiveBadge } from "../components/Badges";
import { usePolling } from "../hooks/usePolling";
import { routesApi } from "../api/routes";
import { busesApi } from "../api/buses";

export default function RouteDetail() {
  const { id } = useParams();

  const { data: route, loading } = usePolling(() => routesApi.get(id), 15000, [id]);
  const { data: buses } = usePolling(() => busesApi.list(id), 5000, [id]);

  if (loading && !route) {
    return (
      <div className="page">
        <Loading label="Loading route..." />
      </div>
    );
  }

  if (!route) {
    return (
      <div className="page">
        <EmptyState icon="🗺️" title="Route not found" />
      </div>
    );
  }

  const orderedStops = [...(route.route_stops || [])].sort((a, b) => a.stop_order - b.stop_order);
  const stopMarkers = orderedStops.map((rs) => ({
    id: rs.stop,
    stop_name: rs.stop_name,
    latitude: rs.latitude,
    longitude: rs.longitude,
    stop_order: rs.stop_order,
  }));
  const polyline = stopMarkers.map((s) => [Number(s.latitude), Number(s.longitude)]);

  return (
    <div className="page">
      <Link to="/app" style={{ color: "var(--blue-600)", fontSize: 13.5, fontWeight: 600 }}>
        ← Back to Live Map
      </Link>

      <h2 style={{ color: "var(--blue-900)", fontSize: 22, marginTop: 10 }}>{route.route_name}</h2>
      <p style={{ color: "var(--gray-600)", fontSize: 14, marginBottom: 18 }}>
        {route.start_point} → {route.end_point}
      </p>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className="card" style={{ padding: 12 }}>
          <MapCanvas buses={buses || []} stops={stopMarkers} polyline={polyline} fitToMarkers />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card">
            <div className="card-title">🚏 Stops in order</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {orderedStops.map((rs) => (
                <div
                  key={rs.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: 10,
                    background: "var(--gray-50)",
                  }}
                >
                  <span className="badge badge-blue">{rs.stop_order}</span>
                  <span style={{ fontSize: 14 }}>{rs.stop_name}</span>
                </div>
              ))}
              {orderedStops.length === 0 && <EmptyState icon="🚏" title="No stops linked to this route yet" />}
            </div>
          </div>

          <div className="card">
            <div className="card-title">🚌 Buses on this route</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(buses || []).map((b) => (
                <Link
                  key={b.id}
                  to={`/app/buses/${b.id}`}
                  className="card"
                  style={{ padding: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <span style={{ fontWeight: 700, color: "var(--blue-900)" }}>{b.plate_no}</span>
                  <LiveBadge live={b.is_live} />
                </Link>
              ))}
              {buses && buses.length === 0 && <EmptyState icon="🚌" title="No buses assigned to this route yet" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
