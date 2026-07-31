import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading, { EmptyState } from "../components/Loading";
import { LiveBadge } from "../components/Badges";
import { RouteBadge } from "../components/Ui";
import { IconChevron, IconRoute, IconTarget } from "../components/Icons";
import { usePolling } from "../hooks/usePolling";
import { routesApi } from "../api/routes";
import { busesApi } from "../api/buses";
import { orderedStops, routeColor } from "../utils/route";

/** Browse every route; expand one to see its stops in order and jump to the map. */
export default function RoutesScreen() {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState(null);

  const { data: routes, loading } = usePolling(() => routesApi.list(), 30000);
  const { data: buses } = usePolling(() => busesApi.list(), 10000);

  const busesOn = (routeId) => (buses || []).filter((b) => String(b.route) === String(routeId));

  return (
    <div className="screen">
      <div className="screen-title">Routes</div>
      <div className="screen-sub">Every Route, with its stops in travel order.</div>

      <div className="page stack">
        {loading && !routes && <Loading label="Loading routes…" />}

        {(routes || []).map((route) => {
          const open = String(openId) === String(route.id);
          const color = routeColor(route.id);
          const stops = orderedStops(route);
          const live = busesOn(route.id).filter((b) => b.is_live).length;

          return (
            <div
              key={route.id}
              style={{
                background: "var(--card)",
                border: open ? `2px solid ${color}` : "1.5px solid var(--border)",
                borderRadius: "var(--r-lg)",
                boxShadow: open ? `0 4px 20px ${color}22` : "var(--shadow-sm)",
                transition: "all 0.18s ease",
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setOpenId(open ? null : route.id)}
                style={{
                  width: "100%",
                  padding: "16px 18px",
                  cursor: "pointer",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <RouteBadge route={route} size="md" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{route.route_name}</div>
                  <div className="row-sub">
                    {route.start_point} → {route.end_point} · {stops.length} stops
                  </div>
                </div>
                {live > 0 && <span className="badge badge-green">{live} live</span>}
                <IconChevron up={open} c="var(--dim)" />
              </button>

              {open && (
                <div style={{ padding: "0 18px 16px", borderTop: `1px solid ${color}22` }} className="animate-in">
                  <div style={{ paddingTop: 14 }}>
                    {stops.map((s, i) => (
                      <div key={s.id} className="timeline-stop">
                        <div className="timeline-rail">
                          <div
                            className="timeline-node"
                            style={{
                              borderColor: color,
                              background: i === 0 || i === stops.length - 1 ? color : "var(--card)",
                              width: i === 0 || i === stops.length - 1 ? 11 : 9,
                              height: i === 0 || i === stops.length - 1 ? 11 : 9,
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
                          {s.stop_name}
                        </span>
                      </div>
                    ))}
                    {stops.length === 0 && (
                      <div style={{ fontSize: 13, color: "var(--muted)", padding: "4px 0 12px" }}>
                        No stops linked to this route yet.
                      </div>
                    )}
                  </div>

                  {busesOn(route.id).length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "6px 0 12px" }}>
                      {busesOn(route.id).map((b) => (
                        <button
                          key={b.id}
                          className="row-card"
                          style={{ padding: "10px 12px", borderRadius: "var(--r-sm)" }}
                          onClick={() => navigate(`/app/buses/${b.id}`)}
                        >
                          <span style={{ flex: 1, fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{b.plate_no}</span>
                          <LiveBadge live={b.is_live} />
                        </button>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button
                      className="btn btn-block"
                      style={{ background: color, color: "#fff", flex: 1 }}
                      onClick={() => navigate("/app", { state: { routeFilter: String(route.id) } })}
                    >
                      <IconTarget size={15} c="#fff" />
                      Track on map
                    </button>
                    <button className="btn btn-ghost" onClick={() => navigate(`/app/routes/${route.id}`)}>
                      Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {routes && routes.length === 0 && (
          <EmptyState icon={<IconRoute size={26} c="var(--dim)" />} title="No routes yet" hint="An admin can add routes from the admin panel." />
        )}
      </div>
    </div>
  );
}
