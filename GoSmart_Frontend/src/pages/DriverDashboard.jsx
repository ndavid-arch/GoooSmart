import { useEffect, useRef, useState } from "react";
import MapCanvas from "../components/MapCanvas";
import Loading, { EmptyState } from "../components/Loading";
import { LiveBadge } from "../components/Badges";
import { usePolling } from "../hooks/usePolling";
import { busesApi } from "../api/buses";
import { apiErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function DriverDashboard() {
  const { user } = useAuth();
  const { data: buses, loading, refetch } = usePolling(() => busesApi.list(), 8000, [user?.id]);
  const bus = (buses || []).find((b) => b.driver === user.id);

  const [sharing, setSharing] = useState(false);
  const [manual, setManual] = useState({ latitude: "", longitude: "" });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const watchIdRef = useRef(null);

  async function pushLocation(latitude, longitude) {
    try {
      await busesApi.updateLocation(bus.id, { latitude, longitude });
      setStatus(`Location shared at ${new Date().toLocaleTimeString()}`);
      setError("");
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not push your location."));
    }
  }

  function startSharing() {
    if (!navigator.geolocation) {
      setError("Geolocation isn't supported by this browser — use manual entry instead.");
      return;
    }
    setSharing(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => pushLocation(pos.coords.latitude.toFixed(6), pos.coords.longitude.toFixed(6)),
      (err) => setError(err.message || "Could not read your GPS position."),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  }

  function stopSharing() {
    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
    setSharing(false);
  }

  useEffect(() => () => stopSharing(), []);

  async function handleManualSubmit(e) {
    e.preventDefault();
    await pushLocation(manual.latitude, manual.longitude);
  }

  if (loading && !buses) {
    return (
      <div className="page">
        <Loading label="Loading your bus..." />
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="page">
        <EmptyState icon="🚌" title="No bus assigned to you yet" hint="Ask an admin to assign you to a bus." />
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <h2 style={{ color: "var(--blue-900)", fontSize: 22 }}>{bus.plate_no}</h2>
        <LiveBadge live={bus.is_live} />
        {bus.route_name && <span className="badge badge-blue">{bus.route_name}</span>}
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className="card" style={{ padding: 12 }}>
          <MapCanvas buses={[bus]} fitToMarkers />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card">
            <div className="card-title">📡 Live location sharing</div>
            <p style={{ fontSize: 13.5, color: "var(--gray-600)", marginBottom: 14 }}>
              Turn this on while driving so passengers can see your bus and ETA in real time.
            </p>
            {error && <div className="alert alert-error">{error}</div>}
            {status && !error && <div className="alert alert-success">{status}</div>}
            <button
              className={`btn btn-block ${sharing ? "btn-danger" : "btn-success"}`}
              onClick={sharing ? stopSharing : startSharing}
            >
              {sharing ? "Stop sharing location" : "Start sharing location"}
            </button>
          </div>

          <div className="card">
            <div className="card-title">✍️ Manual location entry</div>
            <p style={{ fontSize: 13, color: "var(--gray-600)", marginBottom: 10 }}>
              Use this if GPS sharing isn't available on this device.
            </p>
            <form onSubmit={handleManualSubmit}>
              <div className="field">
                <label>Latitude</label>
                <input
                  required
                  value={manual.latitude}
                  onChange={(e) => setManual({ ...manual, latitude: e.target.value })}
                  placeholder="-1.945600"
                />
              </div>
              <div className="field">
                <label>Longitude</label>
                <input
                  required
                  value={manual.longitude}
                  onChange={(e) => setManual({ ...manual, longitude: e.target.value })}
                  placeholder="30.125300"
                />
              </div>
              <button className="btn btn-ghost btn-block">Push this location</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
