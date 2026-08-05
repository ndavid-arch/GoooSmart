import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MapCanvas from "../components/MapCanvas";
import Loading, { EmptyState } from "../components/Loading";
import { LiveBadge } from "../components/Badges";
import { GuestGate, RouteBadge, ScreenHead } from "../components/Ui";
import { IconBell, IconCheck, IconClock, IconFlag } from "../components/Icons";
import { usePolling } from "../hooks/usePolling";
import { busesApi } from "../api/buses";
import { routesApi } from "../api/routes";
import { busReportsApi } from "../api/community";
import { apiErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { ridershipApi, etaAlertsApi } from "../api/analytics";
import { busLines, busRoute, orderedStops, relativeTime, routeColor } from "../utils/route";
import { LEVEL_STYLE, flaggedDimensions, levelLabel } from "../utils/busReports";
import { useTracking } from "../hooks/useTracking";

const THRESHOLDS = [5, 10, 15, 20, 25, 30];

export default function BusDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const tracking = useTracking();

  const { data: bus } = usePolling(() => busesApi.get(id), 5000, [id]);
  const [route, setRoute] = useState(null);

  const [selectedStop, setSelectedStop] = useState("");
  const [eta, setEta] = useState(null);
  const [etaError, setEtaError] = useState("");
  const [etaLoading, setEtaLoading] = useState(false);

  const { data: reports } = usePolling(() => busReportsApi.list(id), 15000, [id]);

  const [boarding, setBoarding] = useState(false);
  const [boardMessage, setBoardMessage] = useState("");
  const [boardError, setBoardError] = useState("");

  const [alertThreshold, setAlertThreshold] = useState(10);
  const [alertError, setAlertError] = useState("");
  const [alertSuccess, setAlertSuccess] = useState("");
  const [alertBusy, setAlertBusy] = useState(false);

  useEffect(() => {
    if (bus?.route) {
      routesApi.get(bus.route).then(setRoute).catch(() => setRoute(null));
    } else {
      setRoute(null);
    }
  }, [bus?.route]);

  useEffect(() => {
    if (!selectedStop) {
      setEta(null);
      return;
    }
    setEtaLoading(true);
    setEtaError("");
    busesApi
      .eta(id, selectedStop)
      .then(setEta)
      .catch((err) => setEtaError(apiErrorMessage(err, "Could not calculate an ETA for this stop.")))
      .finally(() => setEtaLoading(false));
  }, [id, selectedStop]);

  async function handleBoard() {
    setBoarding(true);
    setBoardMessage("");
    setBoardError("");
    try {
      // Tapping in is what unlocks reporting, so confirm they really are aboard.
      // The fix is compared on-device and discarded — nothing is uploaded.
      const problem = await tracking.verifyNearBus(bus);
      if (problem) {
        setBoardError(problem);
        return;
      }
      await ridershipApi.board(Number(id));
      setBoardMessage("Thanks — logged as a rider on this bus. You can now report it from the Reports tab.");
    } catch (err) {
      setBoardError(err?.response ? apiErrorMessage(err, "Could not log your ride.") : err.message);
    } finally {
      setBoarding(false);
    }
  }

  async function handleAlertSubmit(e) {
    e.preventDefault();
    setAlertError("");
    setAlertSuccess("");
    if (!selectedStop) {
      setAlertError("Choose your pickup busstop above first.");
      return;
    }
    setAlertBusy(true);
    try {
      await etaAlertsApi.create({
        bus: Number(id),
        stop: Number(selectedStop),
        threshold_minutes: Number(alertThreshold),
      });
      setAlertSuccess(`You'll be notified ${alertThreshold} minutes before this bus arrives.`);
    } catch (err) {
      setAlertError(apiErrorMessage(err, "Could not set up that alert."));
    } finally {
      setAlertBusy(false);
    }
  }

  if (!bus) {
    return (
      <div className="screen">
        <div className="page">
          <Loading label="Loading bus…" />
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
    highlighted: String(rs.stop) === String(selectedStop),
  }));
  const polyline = stopMarkers.map((s) => [Number(s.latitude), Number(s.longitude)]);
  const color = routeColor(bus.route);
  const isPassenger = user?.role === "passenger";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <ScreenHead title={busLines(bus).title} onBack={() => navigate(-1)} right={<LiveBadge live={bus.is_live} />} />

      <div className="screen">
        {/* Live position, with the travelled part of the line dashed. */}
        <div style={{ position: "relative", height: 250, background: "var(--surface)" }}>
          <MapCanvas
            buses={[bus]}
            stops={stopMarkers}
            polyline={polyline.length > 1 ? polyline : null}
            lineColor={color}
            showProgress
            selectedBusId={bus.id}
            fill
            fitToMarkers
          />
          {!bus.is_live && (
            <div className="map-pill" style={{ top: 12, left: 12 }}>
              <span className="dot" style={{ background: "var(--dim)" }} />
              Last seen {relativeTime(bus.last_updated)}
            </div>
          )}
        </div>

        <div className="page stack" style={{ paddingTop: 14 }}>
          {/* Identity */}
          <div className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <RouteBadge route={busRoute(bus)} size="md" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>{busLines(bus).title}</div>
              <div className="row-sub">{busLines(bus).sub}</div>
            </div>
            {bus.route && (
              <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/app/routes/${bus.route}`)}>
                Route
              </button>
            )}
          </div>

          {/* ETA */}
          <div className="card">
            <div className="card-title">
              <IconClock c="var(--brand)" /> Arrival at your stop
            </div>

            {stops.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--muted)" }}>This route has no stops linked yet.</div>
            ) : (
              <>
                <div className="field" style={{ marginBottom: 12 }}>
                  <label>Choose your pickup busstop</label>
                  <select value={selectedStop} onChange={(e) => setSelectedStop(e.target.value)}>
                    <option value="">Select a pickup busstop…</option>
                    {stops.map((rs) => (
                      <option key={rs.stop} value={rs.stop}>
                        #{rs.stop_order} — {rs.stop_name}
                      </option>
                    ))}
                  </select>
                </div>

                {etaLoading && <Loading label="Calculating ETA…" />}
                {etaError && <div className="alert alert-error">{etaError}</div>}

                {eta && !etaLoading && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 20,
                      padding: "16px 18px",
                      background: "var(--brand-tint)",
                      borderRadius: "var(--r-md)",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 34, fontWeight: 900, color: "var(--brand)", lineHeight: 1, letterSpacing: "-1px" }}>
                        {eta.eta_minutes}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>minutes away</div>
                    </div>
                    <div style={{ width: 1, alignSelf: "stretch", background: "var(--border)" }} />
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", lineHeight: 1.2 }}>
                        {eta.distance_km} km
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--muted)" }}>from {eta.stop}</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Rider actions */}
          {!user && (
            <GuestGate title="Sign in to set alerts and report">
              You're browsing as a guest — the live position and arrival times above are all yours. An
              account adds arrival alerts and lets you report this bus.
            </GuestGate>
          )}

          {isPassenger && (
            <>
              <div className="card">
                <div className="card-title">
                  <IconBell c="var(--brand)" /> Notify me before it arrives
                </div>
                <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 12, lineHeight: 1.6 }}>
                  Choose your pickup busstop above, then pick how much warning you want. Alerts arrive as browser
                  notifications — enable them from your profile.
                </p>

                {alertError && <div className="alert alert-error">{alertError}</div>}
                {alertSuccess && <div className="alert alert-success">{alertSuccess}</div>}

                <form onSubmit={handleAlertSubmit}>
                  <div className="chip-row" style={{ marginBottom: 14 }}>
                    {THRESHOLDS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={`chip ${alertThreshold === m ? "is-active" : ""}`}
                        onClick={() => setAlertThreshold(m)}
                      >
                        {m} min
                      </button>
                    ))}
                  </div>
                  <button className="btn btn-primary btn-block" disabled={alertBusy}>
                    {alertBusy ? "Setting up…" : "Set arrival alert"}
                  </button>
                </form>
              </div>

              {boardMessage && <div className="alert alert-success">{boardMessage}</div>}
              {boardError && <div className="alert alert-error">{boardError}</div>}
              <button className="btn btn-accent btn-lg" disabled={boarding} onClick={handleBoard}>
                <IconCheck c="#fff" /> {boarding ? "Verifying…" : "I'm on this bus"}
              </button>
              {!tracking.on && (
                <p style={{ fontSize: 11.5, color: "var(--muted)", textAlign: "center", marginTop: 8, lineHeight: 1.5 }}>
                  Location tracking is off — turn it on in your profile to verify boarding and submit reports.
                </p>
              )}
            </>
          )}

          {/* What riders on board have flagged about this bus. */}
          <div className="card">
            <div className="card-title">
              <IconFlag c="var(--brand)" /> Rider reports
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(reports || []).map((r) => (
                <div key={r.id} style={{ padding: "12px 14px", borderRadius: "var(--r-sm)", background: "var(--surface)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <strong style={{ fontSize: 13 }}>{r.username}</strong>
                    <span style={{ fontSize: 11.5, color: "var(--dim)" }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="chip-row">
                    {flaggedDimensions(r).map((d) => (
                      <span key={d.key} className={`badge ${LEVEL_STYLE[r[d.key]]?.badge || "badge-gray"}`}>
                        {d.label}: {levelLabel(d.key, r[d.key])}
                      </span>
                    ))}
                  </div>
                  {r.comment && <div style={{ fontSize: 13, lineHeight: 1.5, marginTop: 8 }}>{r.comment}</div>}
                </div>
              ))}

              {reports && reports.length === 0 && (
                <EmptyState
                  icon={<IconFlag size={26} c="var(--dim)" />}
                  title="No reports for this bus yet"
                  hint={
                    user
                      ? "Tap in above, then file one from the Reports tab."
                      : "Riders on board flag cleanliness, crowding and driving here."
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
