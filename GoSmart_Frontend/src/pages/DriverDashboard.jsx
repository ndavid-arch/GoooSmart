import { useEffect, useRef, useState } from "react";
import MapCanvas from "../components/MapCanvas";
import ProfileSheet from "../components/ProfileSheet";
import Loading, { EmptyState } from "../components/Loading";
import { RouteBadge, Sheet } from "../components/Ui";
import { IconBroadcast, IconBus, IconUser } from "../components/Icons";
import { usePolling } from "../hooks/usePolling";
import { busesApi } from "../api/buses";
import { routesApi } from "../api/routes";
import { apiErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { busRoute, orderedStops, relativeTime, routeColor } from "../utils/route";

/**
 * Driver mode: one screen, one big action. Starting a journey turns on GPS
 * watch — every fix is pushed to the API, which is what moves the bus on every
 * passenger's map and refreshes their arrival estimates.
 */
export default function DriverDashboard() {
  const { user } = useAuth();
  const { data: buses, loading, refetch } = usePolling(() => busesApi.list(), 8000, [user?.id]);
  const bus = (buses || []).find((b) => b.driver === user.id);

  const [route, setRoute] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [manual, setManual] = useState({ latitude: "", longitude: "" });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (bus?.route) {
      routesApi.get(bus.route).then(setRoute).catch(() => setRoute(null));
    }
  }, [bus?.route]);

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
    setManualOpen(false);
  }

  if (loading && !buses) {
    return (
      <div className="screen">
        <div className="page">
          <Loading label="Loading your bus…" />
        </div>
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="screen">
        <div className="page" style={{ paddingTop: 60 }}>
          <EmptyState
            icon={<IconBus size={26} c="var(--dim)" />}
            title="No bus assigned to you yet"
            hint="Ask an admin to assign you to a bus, then come back here."
          />
          <button className="btn btn-ghost btn-lg" style={{ marginTop: 12 }} onClick={() => setProfileOpen(true)}>
            Open profile
          </button>
        </div>
        {profileOpen && <ProfileSheet onClose={() => setProfileOpen(false)} />}
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
  const color = routeColor(bus.route);

  return (
    <>
      <div className="map-layer">
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

        <div className="topbar" style={{ justifyContent: "space-between" }}>
          <div className="map-pill" style={{ position: "static" }}>
            <RouteBadge route={busRoute(bus)} />
            <span>{bus.plate_no}</span>
          </div>
          <button className="avatar-btn" onClick={() => setProfileOpen(true)} aria-label="Open profile">
            <IconUser c="#ffffff" size={22} />
          </button>
        </div>

        <div className="map-pill" style={{ top: 76, left: 14 }}>
          <span
            className={`dot ${sharing ? "dot-live" : ""}`}
            style={{ background: sharing ? "var(--brand)" : "var(--dim)" }}
          />
          {sharing ? "Broadcasting GPS" : "Not broadcasting"}
        </div>

        <div className="sheet-dock">
          <div className="sheet">
            <div className="handle" />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>
                  {bus.route_name || "No route assigned"}
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>
                  {sharing ? "Journey in progress" : "Ready to drive"}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>
                  Last position {relativeTime(bus.last_updated)}
                </div>
              </div>
              <span style={{ color: sharing ? "var(--brand)" : "var(--dim)", flexShrink: 0 }}>
                <IconBroadcast size={26} />
              </span>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {status && !error && <div className="alert alert-success">{status}</div>}

            {sharing ? (
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setManualOpen(true)}>
                  Manual fix
                </button>
                <button className="btn btn-solid-danger" style={{ flex: 2 }} onClick={stopSharing}>
                  End journey
                </button>
              </div>
            ) : (
              <>
                <button className="btn btn-primary btn-lg" onClick={startSharing} style={{ marginBottom: 10 }}>
                  Start journey
                </button>
                <button className="btn btn-ghost btn-block" onClick={() => setManualOpen(true)}>
                  Enter location manually
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {manualOpen && (
        <Sheet
          title="Manual location"
          subtitle="Use this if GPS isn't available on this device"
          onClose={() => setManualOpen(false)}
        >
          <form onSubmit={handleManualSubmit} style={{ padding: 20 }}>
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
            <button className="btn btn-primary btn-lg">Push this location</button>
          </form>
        </Sheet>
      )}

      {profileOpen && <ProfileSheet onClose={() => setProfileOpen(false)} />}
    </>
  );
}
