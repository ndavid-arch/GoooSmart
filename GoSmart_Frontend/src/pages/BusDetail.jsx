import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MapCanvas from "../components/MapCanvas";
import Loading, { EmptyState } from "../components/Loading";
import { LiveBadge } from "../components/Badges";
import StarRating from "../components/StarRating";
import { usePolling } from "../hooks/usePolling";
import { busesApi } from "../api/buses";
import { routesApi } from "../api/routes";
import { ratingsApi } from "../api/community";
import { apiErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { ridershipApi, etaAlertsApi } from "../api/analytics";

export default function BusDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const { data: bus } = usePolling(() => busesApi.get(id), 5000, [id]);
  const [route, setRoute] = useState(null);
  const [selectedStop, setSelectedStop] = useState("");
  const [eta, setEta] = useState(null);
  const [etaError, setEtaError] = useState("");
  const [etaLoading, setEtaLoading] = useState(false);

  const { data: summary, refetch: refetchSummary } = usePolling(
    () => ratingsApi.summary(id),
    15000,
    [id]
  );
  const { data: ratings, refetch: refetchRatings } = usePolling(
    () => ratingsApi.list(id),
    15000,
    [id]
  );

  const [ratingForm, setRatingForm] = useState({ cleanliness: 5, safety: 5, comment: "" });
  const [ratingError, setRatingError] = useState("");
  const [ratingSuccess, setRatingSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [boarding, setBoarding] = useState(false);
  const [boardMessage, setBoardMessage] = useState("");
  const [alertStop, setAlertStop] = useState("");
  const [alertThreshold, setAlertThreshold] = useState(5);
  const [alertError, setAlertError] = useState("");
  const [alertSuccess, setAlertSuccess] = useState("");
  const [alertBusy, setAlertBusy] = useState(false);

  async function handleBoard() {
    setBoarding(true);
    setBoardMessage("");
    try {
      await ridershipApi.board(Number(id));
      setBoardMessage("Thanks — logged as a rider on this bus.");
    } catch (err) {
      setBoardMessage(apiErrorMessage(err, "Could not log your ride."));
    } finally {
      setBoarding(false);
    }
  }

  async function handleAlertSubmit(e) {
    e.preventDefault();
    setAlertError("");
    setAlertSuccess("");
    if (!alertStop) {
      setAlertError("Choose a stop first.");
      return;
    }
    setAlertBusy(true);
    try {
      await etaAlertsApi.create({
        bus: Number(id),
        stop: Number(alertStop),
        threshold_minutes: Number(alertThreshold),
      });
      setAlertSuccess("You'll get a push notification when this bus is close.");
    } catch (err) {
      setAlertError(apiErrorMessage(err, "Could not set up that alert."));
    } finally {
      setAlertBusy(false);
    }
  }

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

  async function handleRatingSubmit(e) {
    e.preventDefault();
    setRatingError("");
    setRatingSuccess("");
    setSubmitting(true);
    try {
      await ratingsApi.create({ bus: Number(id), ...ratingForm });
      setRatingSuccess("Thanks for your feedback!");
      setRatingForm({ cleanliness: 5, safety: 5, comment: "" });
      refetchSummary();
      refetchRatings();
    } catch (err) {
      setRatingError(apiErrorMessage(err, "Could not submit your rating."));
    } finally {
      setSubmitting(false);
    }
  }

  if (!bus) {
    return (
      <div className="page">
        <Loading label="Loading bus..." />
      </div>
    );
  }

  const orderedStops = [...(route?.route_stops || [])].sort((a, b) => a.stop_order - b.stop_order);
  const stopMarkers = orderedStops.map((rs) => ({
    id: rs.stop,
    stop_name: rs.stop_name,
    latitude: rs.latitude,
    longitude: rs.longitude,
    stop_order: rs.stop_order,
    highlighted: String(rs.stop) === String(selectedStop),
  }));

  return (
    <div className="page">
      <Link to="/app" style={{ color: "var(--blue-600)", fontSize: 13.5, fontWeight: 600 }}>
        ← Back to Live Map
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <h2 style={{ color: "var(--blue-900)", fontSize: 22 }}>{bus.plate_no}</h2>
        <LiveBadge live={bus.is_live} />
        {bus.route_name && (
          <Link to={`/app/routes/${bus.route}`} className="badge badge-blue">
            {bus.route_name}
          </Link>
        )}
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card" style={{ padding: 12 }}>
            <MapCanvas buses={[bus]} stops={stopMarkers} fitToMarkers />
          </div>

          <div className="card">
            <div className="card-title">⏱️ Estimated arrival</div>
            <div className="field">
              <label>Choose your stop</label>
              <select value={selectedStop} onChange={(e) => setSelectedStop(e.target.value)}>
                <option value="">Select a stop...</option>
                {orderedStops.map((rs) => (
                  <option key={rs.stop} value={rs.stop}>
                    #{rs.stop_order} — {rs.stop_name}
                  </option>
                ))}
              </select>
            </div>
            {etaLoading && <Loading label="Calculating ETA..." />}
            {etaError && <div className="alert alert-error">{etaError}</div>}
            {eta && !etaLoading && (
              <div
                style={{
                  display: "flex",
                  gap: 24,
                  padding: "14px 16px",
                  background: "var(--green-100)",
                  borderRadius: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "var(--green-700)" }}>
                    {eta.eta_minutes} min
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--gray-600)" }}>estimated arrival</div>
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "var(--green-700)" }}>
                    {eta.distance_km} km
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--gray-600)" }}>away from stop</div>
                </div>
              </div>
            )}
          </div>

          {user?.role === "passenger" && (
            <div className="card">
              <div className="card-title">🔔 Notify me</div>
              <p style={{ fontSize: 13, color: "var(--gray-600)", marginBottom: 10 }}>
                Riding this bus? Tap in below. Or get a one-time push notification when it's near
                your stop, or when it's running late — enable notifications in your{" "}
                <Link to="/app/profile" style={{ color: "var(--blue-600)", fontWeight: 600 }}>
                  profile
                </Link>{" "}
                first.
              </p>

              {boardMessage && <div className="alert alert-success">{boardMessage}</div>}
              <button className="btn btn-accent btn-block" disabled={boarding} onClick={handleBoard} style={{ marginBottom: 16 }}>
                {boarding ? "Logging..." : "🚏 I'm on this bus"}
              </button>

              {alertError && <div className="alert alert-error">{alertError}</div>}
              {alertSuccess && <div className="alert alert-success">{alertSuccess}</div>}
              <form onSubmit={handleAlertSubmit} style={{ borderTop: "1px solid var(--gray-100)", paddingTop: 14 }}>
                <div className="field">
                  <label>Alert me near this stop</label>
                  <select value={alertStop} onChange={(e) => setAlertStop(e.target.value)}>
                    <option value="">Select a stop...</option>
                    {orderedStops.map((rs) => (
                      <option key={rs.stop} value={rs.stop}>
                        #{rs.stop_order} — {rs.stop_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>When it's within (minutes)</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={alertThreshold}
                    onChange={(e) => setAlertThreshold(e.target.value)}
                  />
                </div>
                <button className="btn btn-primary btn-block" disabled={alertBusy}>
                  {alertBusy ? "Setting up..." : "Set alert"}
                </button>
              </form>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card">
            <div className="card-title">⭐ Ratings</div>
            <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--blue-900)" }}>
                  {summary?.avg_cleanliness ?? "–"}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--gray-600)" }}>Avg. cleanliness</div>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--blue-900)" }}>
                  {summary?.avg_safety ?? "–"}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--gray-600)" }}>Avg. safety</div>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--blue-900)" }}>
                  {summary?.total_ratings ?? 0}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--gray-600)" }}>Total ratings</div>
              </div>
            </div>

            {user?.role === "passenger" && (
              <form onSubmit={handleRatingSubmit} style={{ borderTop: "1px solid var(--gray-100)", paddingTop: 14 }}>
                {ratingError && <div className="alert alert-error">{ratingError}</div>}
                {ratingSuccess && <div className="alert alert-success">{ratingSuccess}</div>}
                <div className="field">
                  <label>Cleanliness</label>
                  <StarRating
                    value={ratingForm.cleanliness}
                    onChange={(v) => setRatingForm({ ...ratingForm, cleanliness: v })}
                  />
                </div>
                <div className="field">
                  <label>Safety</label>
                  <StarRating
                    value={ratingForm.safety}
                    onChange={(v) => setRatingForm({ ...ratingForm, safety: v })}
                  />
                </div>
                <div className="field">
                  <label>Comment (optional)</label>
                  <textarea
                    rows={2}
                    value={ratingForm.comment}
                    onChange={(e) => setRatingForm({ ...ratingForm, comment: e.target.value })}
                  />
                </div>
                <button className="btn btn-success btn-block" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit rating"}
                </button>
              </form>
            )}
          </div>

          <div className="card">
            <div className="card-title">Recent feedback</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 260, overflowY: "auto" }}>
              {(ratings || []).map((r) => (
                <div key={r.id} style={{ padding: "10px 12px", borderRadius: 10, background: "var(--gray-50)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <strong style={{ fontSize: 13.5 }}>{r.username}</strong>
                    <span style={{ fontSize: 12, color: "var(--gray-400)" }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--gray-600)", marginBottom: 4 }}>
                    Cleanliness {r.cleanliness}/5 · Safety {r.safety}/5
                  </div>
                  {r.comment && <div style={{ fontSize: 13.5 }}>{r.comment}</div>}
                </div>
              ))}
              {ratings && ratings.length === 0 && <EmptyState icon="⭐" title="No ratings yet" hint="Be the first to rate this bus." />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
