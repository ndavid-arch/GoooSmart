import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { RoleBadge } from "../components/Badges";
import { ScreenHead, Toggle } from "../components/Ui";
import { IconBell, IconLogout, IconMoon, IconUser } from "../components/Icons";

/**
 * Full-page profile, kept for direct links to /app/profile. The same settings
 * are reachable from the avatar sheet on the map screens.
 */
export default function Profile() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const push = usePushNotifications();
  const navigate = useNavigate();

  if (!user) return null;

  const rows = [
    ["Username", user.username],
    ["Email", user.email || "—"],
    ["Phone", user.phone || "—"],
    ...(user.role === "driver" ? [["License number", user.license_no || "—"]] : []),
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <ScreenHead title="Profile" onBack={() => navigate(-1)} />

      <div className="screen">
        <div
          style={{
            background: "linear-gradient(150deg,#14532d,#16a34a)",
            margin: 16,
            borderRadius: "var(--r-lg)",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 62,
              height: 62,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
              border: "2px solid rgba(255,255,255,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconUser c="#ffffff" size={28} />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{user.username}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
              {user.email || "No email on file"}
            </div>
          </div>
        </div>

        <div className="page stack">
          <div className="card">
            <div className="card-title">Account</div>
            <div style={{ marginBottom: 10 }}>
              <RoleBadge role={user.role} />
            </div>
            {rows.map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "11px 0",
                  borderBottom: "1px solid var(--border)",
                  fontSize: 13.5,
                }}
              >
                <span style={{ color: "var(--muted)" }}>{label}</span>
                <span style={{ fontWeight: 600, textAlign: "right" }}>{value}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title">
              <IconBell c="var(--brand)" /> Push notifications
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14, lineHeight: 1.6 }}>
              Get notified when a bus you're tracking is almost at your stop, or is running behind
              schedule. Set the alerts themselves from any bus page.
            </p>
            {push.error && <div className="alert alert-error">{push.error}</div>}
            {!push.supported && !push.loading && (
              <div className="alert alert-error">This browser doesn't support push notifications.</div>
            )}
            {push.supported && (
              <button
                className={`btn btn-block ${push.enabled ? "btn-danger" : "btn-primary"}`}
                disabled={push.loading}
                onClick={push.enabled ? push.disable : push.enable}
              >
                {push.loading ? "Checking…" : push.enabled ? "Turn off notifications" : "Enable notifications"}
              </button>
            )}
          </div>

          <div className="card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ color: "var(--muted)", display: "flex" }}>
              <IconMoon />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Dark mode</div>
              <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{dark ? "On" : "Off"}</div>
            </div>
            <Toggle on={dark} onChange={toggle} label="Dark mode" />
          </div>

          <button
            className="btn btn-danger btn-lg"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            <IconLogout /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
