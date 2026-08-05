import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading, { EmptyState } from "../components/Loading";
import { GuestGate, RouteBadge } from "../components/Ui";
import { IconBell, IconChevronRight, IconClock } from "../components/Icons";
import { usePolling } from "../hooks/usePolling";
import { etaAlertsApi } from "../api/analytics";
import { busesApi } from "../api/buses";
import { apiErrorMessage } from "../api/client";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { busRoute } from "../utils/route";
import { useAuth } from "../context/AuthContext";

/**
 * Arrival alerts the rider has set up. Alerts are created from a bus page;
 * this screen lists, explains and cancels them, and manages push permission.
 */
export default function AlertsScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const push = usePushNotifications();
  // Alerts are per-account records, so guests have nothing to fetch.
  const { data: alerts, loading, refetch } = usePolling(
    () => (user ? etaAlertsApi.list() : Promise.resolve([])),
    20000,
    [user?.id]
  );
  const { data: buses } = usePolling(() => busesApi.list(), 15000);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  const busFor = (id) => (buses || []).find((b) => String(b.id) === String(id));

  async function handleRemove(id) {
    setError("");
    setRemovingId(id);
    try {
      await etaAlertsApi.remove(id);
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not cancel that alert."));
    } finally {
      setRemovingId(null);
    }
  }

  const list = alerts || [];

  return (
    <div className="screen">
      <div className="screen-title">Alerts</div>
      <div className="screen-sub">Get told before your bus reaches your stop.</div>

      <div className="page stack">
        {!user && (
          <GuestGate title="Sign in to set arrival alerts">
            Alerts are saved to your account so we can notify you before your bus reaches your stop.
            Everything else — the map, routes and live arrival times — works without one.
          </GuestGate>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        {/* Push permission gate — alerts are delivered as browser notifications. */}
        {user && push.supported && !push.enabled && !push.loading && (
          <div className="card" style={{ borderColor: "var(--brand)", background: "var(--brand-tint)" }}>
            <div className="card-title">
              <IconBell c="var(--brand)" /> Turn on notifications
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 14 }}>
              Alerts arrive as browser notifications. Enable them once and every alert below will reach you.
            </p>
            {push.error && <div className="alert alert-error">{push.error}</div>}
            <button className="btn btn-primary btn-block" onClick={push.enable}>
              Enable notifications
            </button>
          </div>
        )}

        {loading && !alerts && <Loading label="Loading your alerts…" />}

        {list.map((a) => {
          const bus = busFor(a.bus);
          return (
            <div key={a.id} className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <RouteBadge route={busRoute(bus) || { route_name: a.bus_plate_no || "" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row-title">{a.stop_name || `Stop #${a.stop}`}</div>
                <div className="row-sub">
                  {bus?.route_name || a.bus_plate_no || bus?.plate_no || `Bus #${a.bus}`} · alert{" "}
                  {a.threshold_minutes} min before arrival
                </div>
                {a.notified_at && (
                  <div style={{ fontSize: 11, color: "var(--brand)", marginTop: 3, fontWeight: 600 }}>Already sent</div>
                )}
              </div>
              <button
                className="btn btn-danger btn-sm"
                disabled={removingId === a.id}
                onClick={() => handleRemove(a.id)}
              >
                {removingId === a.id ? "…" : "Cancel"}
              </button>
            </div>
          );
        })}

        {user && alerts && list.length === 0 && (
          <EmptyState
            icon={<IconClock size={26} c="var(--dim)" />}
            title="No alerts yet"
            hint="Open a bus, choose your pickup busstop, and pick how early you want to be told."
          />
        )}

        {user && (
        <button className="row-card" onClick={() => navigate("/app")} style={{ marginTop: 4 }}>
          <span style={{ color: "var(--brand)", display: "flex" }}>
            <IconBell />
          </span>
          <div style={{ flex: 1 }}>
            <div className="row-title">Set up a new alert</div>
            <div className="row-sub">Pick a bus on the map, then choose your pickup busstop</div>
          </div>
          <IconChevronRight c="var(--dim)" />
        </button>
        )}
      </div>
    </div>
  );
}
