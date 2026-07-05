import { useState } from "react";
import { Link } from "react-router-dom";
import MapCanvas from "../components/MapCanvas";
import Loading, { EmptyState } from "../components/Loading";
import { LiveBadge } from "../components/Badges";
import { usePolling } from "../hooks/usePolling";
import { busesApi } from "../api/buses";
import { routesApi } from "../api/routes";

export default function PassengerDashboard() {
  const [routeFilter, setRouteFilter] = useState("");

  const { data: routes } = usePolling(() => routesApi.list(), 30000);
  const { data: buses, loading } = usePolling(
    () => busesApi.list(routeFilter || undefined),
    5000,
    [routeFilter]
  );

  const liveCount = (buses || []).filter((b) => b.is_live).length;

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ color: "var(--blue-900)", fontSize: 22 }}>Live Bus Map</h2>
          <p style={{ color: "var(--gray-600)", fontSize: 13.5 }}>
            Updates automatically every 5 seconds — Kimironko corridor.
          </p>
        </div>
        <div className="field" style={{ marginBottom: 0, minWidth: 220 }}>
          <label>Filter by route</label>
          <select value={routeFilter} onChange={(e) => setRouteFilter(e.target.value)}>
            <option value="">All routes</option>
            {(routes || []).map((r) => (
              <option key={r.id} value={r.id}>
                {r.route_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className="card" style={{ padding: 12 }}>
          <MapCanvas buses={buses || []} fitToMarkers />
        </div>

        <div className="card">
          <div className="card-title">
            <span className="badge badge-green">{liveCount} live</span>
            Buses {routeFilter ? "on this route" : "on the corridor"}
          </div>

          {loading && !buses && <Loading label="Loading buses..." />}
          {buses && buses.length === 0 && (
            <EmptyState icon="🚌" title="No buses found" hint="Try a different route filter." />
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 380, overflowY: "auto" }}>
            {(buses || []).map((b) => (
              <Link
                key={b.id}
                to={`/app/buses/${b.id}`}
                className="card"
                style={{ padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: "var(--blue-900)" }}>{b.plate_no}</div>
                  <div style={{ fontSize: 12.5, color: "var(--gray-600)" }}>{b.route_name || "No route assigned"}</div>
                </div>
                <LiveBadge live={b.is_live} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <h3 style={{ color: "var(--blue-900)", fontSize: 17, marginBottom: 12 }}>Routes</h3>
        <div className="grid-auto">
          {(routes || []).map((r) => (
            <Link key={r.id} to={`/app/routes/${r.id}`} className="card">
              <div className="card-title" style={{ marginBottom: 4 }}>
                {r.route_name}
              </div>
              <div style={{ fontSize: 13, color: "var(--gray-600)" }}>
                {r.start_point} → {r.end_point}
              </div>
              <div style={{ marginTop: 8 }}>
                <span className="badge badge-blue">{r.route_stops?.length || 0} stops</span>
              </div>
            </Link>
          ))}
          {routes && routes.length === 0 && <EmptyState icon="🗺️" title="No routes yet" />}
        </div>
      </div>
    </div>
  );
}
