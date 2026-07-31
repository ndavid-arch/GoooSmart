import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MapCanvas from "../components/MapCanvas";
import TopBar from "../components/TopBar";
import ProfileSheet from "../components/ProfileSheet";
import Loading, { EmptyState } from "../components/Loading";
import { LiveBadge } from "../components/Badges";
import { RouteBadge } from "../components/Ui";
import { IconChevronRight, IconTarget, IconX } from "../components/Icons";
import { usePolling } from "../hooks/usePolling";
import { busesApi } from "../api/buses";
import { routesApi } from "../api/routes";
import {
  busLines,
  busRoute,
  orderedStops,
  relativeTime,
  routeColor,
  routeMatchRank,
  routeMatches,
} from "../utils/route";

/**
 * The home screen: a full-bleed live map with floating search, a route filter
 * strip, and a bottom sheet listing the buses currently running in Kigali.
 */
export default function PassengerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  // "Track on map" from the Routes tab arrives with a route preselected.
  const [routeFilter, setRouteFilter] = useState(() => location.state?.routeFilter || "");
  const [query, setQuery] = useState("");
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const { data: routes } = usePolling(() => routesApi.list(), 30000);
  const { data: buses, loading } = usePolling(
    () => busesApi.list(routeFilter || undefined),
    5000,
    [routeFilter]
  );

  // The selected route's stops draw its line on the map, as in the wireframe.
  const { data: activeRoute } = usePolling(
    () => (routeFilter ? routesApi.get(routeFilter) : Promise.resolve(null)),
    30000,
    [routeFilter]
  );

  const allBuses = buses || [];
  const liveCount = allBuses.filter((b) => b.is_live).length;

  const matchedRoutes = useMemo(() => {
    if (!query.trim()) return [];
    return (routes || [])
      .filter((r) => routeMatches(r, query))
      .sort((a, b) => routeMatchRank(a, query) - routeMatchRank(b, query));
  }, [routes, query]);

  const visibleBuses = useMemo(() => {
    // A bus is a match when it runs a matching route — riders search by line or
    // destination, never by plate.
    const matchedIds = new Set(matchedRoutes.map((r) => String(r.id)));
    const list = query.trim() ? allBuses.filter((b) => matchedIds.has(String(b.route))) : allBuses;
    // Live buses first, then most recently seen.
    return [...list].sort((a, b) => Number(b.is_live) - Number(a.is_live));
  }, [allBuses, matchedRoutes, query]);

  const selectedBus = allBuses.find((b) => String(b.id) === String(selectedBusId)) || null;

  const stopMarkers = activeRoute
    ? orderedStops(activeRoute).map((rs) => ({
        id: rs.stop,
        stop_name: rs.stop_name,
        latitude: rs.latitude,
        longitude: rs.longitude,
        stop_order: rs.stop_order,
      }))
    : [];
  const polyline = stopMarkers.map((s) => [Number(s.latitude), Number(s.longitude)]);

  return (
    <>
      <div className="map-layer">
        <MapCanvas
          buses={allBuses}
          stops={stopMarkers}
          polyline={polyline.length > 1 ? polyline : null}
          lineColor={routeFilter ? routeColor(routeFilter) : null}
          selectedBusId={selectedBusId}
          onSelectBus={(b) => setSelectedBusId(b.id)}
          fill
          fitToMarkers
        />

        <TopBar
          query={query}
          onQuery={setQuery}
          onProfile={() => setProfileOpen(true)}
          placeholder="Route number, name or where to?"
        />

        <div className="map-pill" style={{ top: 76, left: 14 }}>
          <span className={`dot ${liveCount ? "dot-live" : ""}`} style={{ background: liveCount ? "var(--brand)" : "var(--dim)" }} />
          {liveCount} live · {allBuses.length} total
        </div>

        <div className="sheet-dock">
          {/* Route filter strip — replaces the old dropdown. */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "2px 2px 2px", scrollbarWidth: "none" }}>
            <button
              className={`chip ${routeFilter === "" ? "is-active" : ""}`}
              onClick={() => setRouteFilter("")}
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              All routes
            </button>
            {(routes || []).map((r) => (
              <button
                key={r.id}
                className={`chip ${String(routeFilter) === String(r.id) ? "is-active" : ""}`}
                onClick={() => setRouteFilter(String(routeFilter) === String(r.id) ? "" : String(r.id))}
                style={{
                  boxShadow: "var(--shadow-sm)",
                  ...(String(routeFilter) === String(r.id)
                    ? { background: routeColor(r.id), borderColor: routeColor(r.id) }
                    : null),
                }}
              >
                {r.route_number ? `${r.route_number} · ${r.route_name}` : r.route_name}
              </button>
            ))}
          </div>

          {selectedBus ? (
            <div className="floating-card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <RouteBadge route={busRoute(selectedBus)} size="md" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row-title">{busLines(selectedBus).title}</div>
                <div className="row-sub">
                  {busLines(selectedBus).sub} ·{" "}
                  {selectedBus.is_live ? "live" : relativeTime(selectedBus.last_updated)}
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate(`/app/buses/${selectedBus.id}`)}>
                Track
              </button>
              <button className="icon-btn icon-btn-round" onClick={() => setSelectedBusId(null)} aria-label="Deselect bus">
                <IconX />
              </button>
            </div>
          ) : null}

          <div className="sheet" style={{ maxHeight: "42vh", display: "flex", flexDirection: "column", borderRadius: "var(--r-xl)" }}>
            <div className="handle" />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div className="card-label" style={{ marginBottom: 0 }}>
                {query ? "Search results" : routeFilter ? "Buses on this route" : "Live Buses"}
              </div>
              <span className="badge badge-green">{liveCount} live</span>
            </div>

            <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingBottom: 4 }}>
              {loading && !buses && <Loading label="Loading buses…" />}

              {matchedRoutes.map((r) => (
                <button key={`route-${r.id}`} className="row-card" onClick={() => navigate(`/app/routes/${r.id}`)}>
                  <RouteBadge route={r} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row-title">{r.route_name}</div>
                    <div className="row-sub">
                      {r.start_point} → {r.end_point}
                    </div>
                  </div>
                  <IconChevronRight c="var(--dim)" />
                </button>
              ))}

              {visibleBuses.map((b) => (
                <button
                  key={b.id}
                  className="row-card"
                  onClick={() => setSelectedBusId(b.id)}
                  style={
                    String(b.id) === String(selectedBusId)
                      ? { borderColor: routeColor(b.route), boxShadow: `0 2px 14px ${routeColor(b.route)}22` }
                      : null
                  }
                >
                  <RouteBadge route={busRoute(b)} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row-title">{busLines(b).title}</div>
                    <div className="row-sub">{busLines(b).sub}</div>
                  </div>
                  <LiveBadge live={b.is_live} />
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/app/buses/${b.id}`);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && navigate(`/app/buses/${b.id}`)}
                    style={{ display: "flex", color: "var(--dim)", padding: 4 }}
                    aria-label={`Open ${b.plate_no}`}
                  >
                    <IconChevronRight />
                  </span>
                </button>
              ))}

              {buses && visibleBuses.length === 0 && matchedRoutes.length === 0 && (
                <EmptyState
                  icon={<IconTarget size={30} c="var(--dim)" />}
                  title={query ? "Nothing matched" : "No buses found"}
                  hint={
                    query
                      ? "Try a route number like 305, a route name, or where you're heading."
                      : "Try a different route filter."
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {profileOpen && (
        <ProfileSheet
          onClose={() => setProfileOpen(false)}
          stats={{ routes: (routes || []).length, live: liveCount }}
        />
      )}
    </>
  );
}
