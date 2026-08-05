import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ScreenHead } from "../components/Ui";
import { IconBus, IconCheck, IconLocation } from "../components/Icons";
import { setTrackingPreference } from "../hooks/useTracking";

const DRIVER_POINTS = [
  "Your phone's GPS will broadcast this bus's live location.",
  "Passengers will see your bus on the map in real time.",
  "Location sharing is active only during your journey.",
  "You can end the journey at any time to stop broadcasting.",
];

const PASSENGER_POINTS = [
  "Your location is used to verify you are on the bus when submitting reports.",
  "Without tracking you can still view routes, plan trips, and set alerts.",
  "Your location is never stored or shared with third parties.",
  "You can change this preference at any time in Settings.",
];

/**
 * Location consent step shown right after registration. Accepting triggers the
 * real browser permission prompt, which is what Driver mode needs to broadcast.
 */
export default function Consent() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const isDriver = user?.role === "driver";
  const points = isDriver ? DRIVER_POINTS : PASSENGER_POINTS;
  const home = isDriver ? "/driver" : user?.role === "admin" ? "/admin" : "/app";

  function finish(granted) {
    setTrackingPreference(granted);
    navigate(home, { replace: true });
  }

  function handleAccept() {
    if (!navigator.geolocation) {
      finish(false);
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        setBusy(false);
        finish(true);
      },
      () => {
        // Denied or unavailable — carry on; Driver mode surfaces this again.
        setBusy(false);
        finish(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      {!isDriver && <ScreenHead title="Location Access" onBack={() => finish(false)} />}

      <div style={{ flex: 1, overflowY: "auto", padding: "32px 24px 24px", display: "flex", flexDirection: "column", alignItems: "center" }} className="animate-in">
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            background: isDriver ? "var(--text)" : "var(--brand-tint)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          {isDriver ? <IconBus size={30} c="var(--bg)" /> : <IconLocation size={30} c="var(--brand)" />}
        </div>

        <div style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", textAlign: "center", letterSpacing: "-0.5px", marginBottom: 8 }}>
          {isDriver ? "Tracking Required" : "Allow Location Access?"}
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", lineHeight: 1.6, marginBottom: 28, maxWidth: 320 }}>
          {isDriver
            ? "Drivers must enable location tracking. Your phone becomes the GPS source for passengers tracking this bus."
            : "GoSmart uses your location to verify bus boarding when you submit community reports."}
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {points.map((pt) => (
            <div key={pt} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "var(--brand-tint)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                <IconCheck size={11} c="var(--brand)" />
              </div>
              <span style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.55 }}>{pt}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 24px 32px", display: "flex", flexDirection: "column", gap: 10 }}>
        <button className="btn btn-primary btn-lg" onClick={handleAccept} disabled={busy}>
          {busy ? "Waiting for permission…" : isDriver ? "Accept & Start Driving" : "Allow Location Access"}
        </button>

        {!isDriver ? (
          <button className="btn btn-ghost btn-lg" onClick={() => finish(false)}>
            Continue Without Tracking
          </button>
        ) : (
          <>
            <div style={{ fontSize: 12, color: "var(--dim)", textAlign: "center", lineHeight: 1.5 }}>
              Tracking is required for drivers.
            </div>
            <button
              className="btn btn-ghost btn-lg"
              onClick={() => {
                logout();
                navigate("/register", { replace: true });
              }}
            >
              Sign up as a passenger instead
            </button>
          </>
        )}
      </div>
    </div>
  );
}
