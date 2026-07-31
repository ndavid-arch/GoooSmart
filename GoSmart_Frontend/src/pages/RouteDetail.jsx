import { useParams, useNavigate } from "react-router-dom";
import MapCanvas from "../components/MapCanvas";
import Loading, { EmptyState } from "../components/Loading";
import { LiveBadge } from "../components/Badges";
import { RouteBadge, ScreenHead } from "../components/Ui";
import { IconBus, IconChevronRight, IconRoute, IconTarget } from "../components/Icons";
import { usePolling } from "../hooks/usePolling";
import { routesApi } from "../api/routes";
import { busesApi } from "../api/buses";
import { orderedStops, routeColor } from "../utils/route";

export default function RouteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: route, loading } = usePolling(() => routesApi.get(id), 15000, [id]);
  const { data: buses } = usePolling(() => busesApi.list(id), 5000, [id]);

  if (loading && !route) {
    return (
      <div className="screen">
        <div className="page">
          <Loading label="Loading route…" />
        </div>
      </div>
    );
  }

  if (!route) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <ScreenHead title="Route" onBack={() => navigate(-1)} />
        <div className="screen">
          <div className="page">
            <EmptyState icon={<IconRoute size={26} c="var(--dim)" />} title="Route not found" />
          </div>
        </div>
      </div>
    );
  }

  const stops = orderedStops(route);
  const stopMarkers = stops.map((rs) => ({
    id: rs.stop,
    stop_name: rs.stop_name,
    latitude: rs.latitude,
    longitude: rs.longitude,
    stop_order: rs.stop_order,
  }));
  const polyline = stopMarkers.map((s) => [Number(s.latitude), Number(s.longitude)]);
  const color = routeColor(route.id);
  const live = (buses || []).filter((b) => b.is_live).length;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <ScreenHead title={route.route_name} onBack={() => navigate(-1)} right={<RouteBadge route={route} size="md" />} />

      <div className="screen">
        <div style={{ position: "relative", height: 250, background: "var(--surface)" }}>
          <MapCanvas
            buses={buses || []}
            stops={stopMarkers}
            polyline={polyline.length > 1 ? polyline : null}
            lineColor={color}
            fill
            fitToMarkers
            onSelectBus={(b) => navigate(`/app/buses/${b.id}`)}
          />
          <div className="map-pill" style={{ top: 12, left: 12 }}>
            <span className={`dot ${live ? "dot-live" : ""}`} style={{ background: live ? color : "var(--dim)" }} />
            {live} live on this route
          </div>
        </div>

        <div className="page stack" style={{ paddingTop: 14 }}>
          <div className="card">
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>
              {route.start_point} → {route.end_point}
            </div>
            <div className="row-sub" style={{ marginTop: 3 }}>
              {stops.length} stops on this line
            </div>
            <button
              className="btn btn-block"
              style={{ background: color, color: "#fff", marginTop: 14 }}
              onClick={() => navigate("/app", { state: { routeFilter: String(route.id) } })}
            >
              <IconTarget size={15} c="#fff" />
              Track on the live map
            </button>
          </div>

          <div className="card">
            <div className="card-title">Stops in order</div>
            {stops.map((rs, i) => (
              <div key={rs.id} className="timeline-stop">
                <div className="timeline-rail">
                  <div
                    className="timeline-node"
                    style={{
                      borderColor: color,
                      background: i === 0 || i === stops.length - 1 ? color : "var(--card)",
                    }}
                  />
                  {i < stops.length - 1 && <div className="timeline-line" style={{ background: color }} />}
                </div>
                <span
                  className="timeline-label"
                  style={{
                    fontWeight: i === 0 || i === stops.length - 1 ? 700 : 500,
                    color: i === 0 || i === stops.length - 1 ? "var(--text)" : "var(--muted)",
                  }}
                >
                  {rs.stop_name}
                </span>
              </div>
            ))}
            {stops.length === 0 && <EmptyState title="No stops linked to this route yet" />}
          </div>

          <div className="card">
            <div className="card-title">Buses on this route</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(buses || []).map((b) => (
                <button key={b.id} className="row-card" onClick={() => navigate(`/app/buses/${b.id}`)}>
                  <span style={{ flex: 1, fontWeight: 700, fontSize: 13.5, color: "var(--text)" }}>{b.plate_no}</span>
                  <LiveBadge live={b.is_live} />
                  <IconChevronRight c="var(--dim)" />
                </button>
              ))}
              {buses && buses.length === 0 && (
                <EmptyState icon={<IconBus size={26} c="var(--dim)" />} title="No buses assigned to this route yet" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
