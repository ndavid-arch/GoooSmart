import { useNavigate } from "react-router-dom";
import MapCanvas from "../components/MapCanvas";
import { usePolling } from "../hooks/usePolling";
import { busesApi } from "../api/buses";
import { useAuth } from "../context/AuthContext";
import { LogoMark } from "../components/Icons";

/**
 * Map-first welcome screen. The map is live even before sign-in — the API
 * serves buses and routes read-only to anonymous visitors.
 */
export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: buses } = usePolling(() => busesApi.list(), 10000);

  const live = (buses || []).filter((b) => b.is_live);

  const goHome = () => {
    if (!user) return navigate("/register");
    if (user.role === "driver") return navigate("/driver");
    if (user.role === "admin") return navigate("/admin");
    return navigate("/app");
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="map-layer">
        <MapCanvas buses={buses || []} fill fitToMarkers />

        <div className="topbar">
          <div
            style={{
              background: "var(--card)",
              borderRadius: "var(--r-md)",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow: "var(--shadow-float)",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "var(--brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <LogoMark size={18} bg="#16a34a" fg="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.4px", lineHeight: 1 }}>
                GoSmart
              </div>
              <div style={{ fontSize: 9, color: "var(--dim)", fontWeight: 600, letterSpacing: "0.1em" }}>
                KIGALI TRANSIT
              </div>
            </div>
          </div>
        </div>

        <div className="map-pill" style={{ top: 76, left: 14 }}>
          <span className={`dot ${live.length ? "dot-live" : ""}`} style={{ background: live.length ? "var(--brand)" : "var(--dim)" }} />
          {live.length} {live.length === 1 ? "bus" : "buses"} live now
        </div>
      </div>

      <div className="sheet" style={{ paddingBottom: 28 }}>
        <div className="handle" />
        <div style={{ fontSize: 20, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 4 }}>
          {user ? `Welcome back, ${user.username}` : "Welcome to GoSmart"}
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16, lineHeight: 1.55 }}>
          Track buses in Kigali in real time, get arrival estimates for your stop, and see what riders
          are reporting before you board.
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {["Live tracking", "ETA to your stop", "Rider ratings", "Traffic reports"].map((f) => (
            <span key={f} className="badge badge-blue">
              {f}
            </span>
          ))}
        </div>

        <button className="btn btn-primary btn-lg" onClick={goHome} style={{ marginBottom: 10 }}>
          {user ? "Open live map" : "Create an account"}
        </button>

        {!user && (
          <>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate("/login")} style={{ marginBottom: 12 }}>
              I already have an account
            </button>
            {/* In a hurry? The whole map works without signing up. */}
            <button
              onClick={() => navigate("/app")}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 13.5,
                fontWeight: 600,
                color: "var(--muted)",
                padding: 8,
              }}
            >
              Browse as guest
            </button>
          </>
        )}
      </div>
    </div>
  );
}
