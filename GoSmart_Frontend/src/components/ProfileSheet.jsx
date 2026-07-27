import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { etaAlertsApi } from "../api/analytics";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { RoleBadge } from "./Badges";
import { Toggle } from "./Ui";
import {
  IconBack,
  IconBell,
  IconBus,
  IconCheck,
  IconChevronRight,
  IconClipboard,
  IconCog,
  IconCone,
  IconLocation,
  IconLogout,
  IconMoon,
  IconUser,
} from "./Icons";
import { useTracking } from "../hooks/useTracking";

/**
 * Profile is a bottom-sheet overlay with drill-down pages, mirroring the
 * wireframe. Every entry maps to something GoSmart can actually do.
 */
export default function ProfileSheet({ onClose, stats }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const push = usePushNotifications();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [alertCount, setAlertCount] = useState(null);

  const isDriver = user?.role === "driver";
  const tracking = useTracking();

  // Fetched once on open so the header counts are real, not decorative.
  // Drivers don't set arrival alerts, so there's nothing to count for them.
  useEffect(() => {
    if (isDriver) return undefined;
    let cancelled = false;
    etaAlertsApi
      .list()
      .then((rows) => !cancelled && setAlertCount(Array.isArray(rows) ? rows.length : 0))
      .catch(() => !cancelled && setAlertCount(null));
    return () => {
      cancelled = true;
    };
  }, [isDriver]);

  if (!user) return <GuestSheet onClose={onClose} dark={dark} onToggleDark={toggle} />;

  const go = (to) => {
    onClose();
    navigate(to);
  };

  const menu = [
    { key: "account", icon: <IconCog />, label: "Account details", sub: user.email || "No email on file" },
    {
      key: "push",
      icon: <IconBell />,
      label: "Push notifications",
      sub: push.loading ? "Checking…" : push.enabled ? "On" : "Off",
    },
    { key: "appearance", icon: <IconMoon />, label: "Appearance", sub: dark ? "Dark mode" : "Light mode" },
    // Alerts and reports are rider features — a driver's screens can't reach them.
    ...(isDriver
      ? [{ key: "bus", icon: <IconBus />, label: "My bus", sub: "Driver mode", to: "/driver" }]
      : [
          {
            key: "location",
            icon: <IconLocation />,
            label: "Location tracking",
            sub: tracking.on ? "On — you can submit reports" : "Off",
          },
          { key: "alerts", icon: <IconClipboard />, label: "My arrival alerts", sub: "Manage ETA alerts", to: "/app/alerts" },
          { key: "reports", icon: <IconCone />, label: "Reports", sub: "Traffic and bus reports", to: "/app/reports" },
        ]),
    ...(user.role === "admin"
      ? [{ key: "admin", icon: <IconCog />, label: "Admin panel", sub: "Routes, stops, buses", to: "/admin" }]
      : []),
  ];

  const titles = {
    account: "Account details",
    push: "Push notifications",
    appearance: "Appearance",
    location: "Location tracking",
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="overlay-sheet" onClick={(e) => e.stopPropagation()}>
        <div style={{ flexShrink: 0 }}>
          <div className="handle" style={{ margin: "10px auto 0" }} />
          <div style={{ padding: "12px 20px 14px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid var(--border)" }}>
            {page && (
              <button className="icon-btn" onClick={() => setPage(null)} aria-label="Back">
                <IconBack />
              </button>
            )}
            <div style={{ fontSize: 18, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.4px" }}>
              {page ? titles[page] : "Profile"}
            </div>
          </div>
        </div>

        <div className="overlay-body">
          {!page && (
            <>
              <div
                style={{
                  background: "linear-gradient(150deg,#14532d,#16a34a)",
                  margin: "14px 14px 0",
                  borderRadius: "var(--r-lg)",
                  padding: 22,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.18)",
                    border: "2px solid rgba(255,255,255,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconUser c="#ffffff" size={26} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>{user.username}</div>
                  <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
                    {user.email || "No email on file"}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        background: "rgba(255,255,255,0.16)",
                        borderRadius: 10,
                        padding: "5px 12px",
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.95)",
                        textTransform: "capitalize",
                      }}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 24 }}>
                  {[
                    ...(isDriver ? [] : [[alertCount ?? stats?.alerts ?? "–", "My alerts"]]),
                    [stats?.routes ?? "–", "Routes"],
                    [stats?.live ?? "–", "Live now"],
                  ].map(([v, l]) => (
                    <div key={l} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>{v}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)" }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: "12px 14px 8px", display: "flex", flexDirection: "column", gap: 6 }}>
                {menu.map((item) => (
                  <button
                    key={item.key}
                    className="row-card"
                    style={{ padding: "13px 16px", borderRadius: "var(--r-md)" }}
                    onClick={() => (item.to ? go(item.to) : setPage(item.key))}
                  >
                    <span style={{ display: "flex", width: 22, color: "var(--muted)" }}>{item.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="row-title">{item.label}</div>
                      <div className="row-sub">{item.sub}</div>
                    </div>
                    <IconChevronRight c="var(--dim)" />
                  </button>
                ))}

                <button
                  className="row-card"
                  style={{ padding: "13px 16px", borderRadius: "var(--r-md)", marginTop: 4 }}
                  onClick={() => {
                    logout();
                    onClose();
                    navigate("/");
                  }}
                >
                  <span style={{ display: "flex", width: 22, color: "var(--danger)" }}>
                    <IconLogout />
                  </span>
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: "var(--danger)" }}>Sign out</span>
                  <IconChevronRight c="var(--danger)" />
                </button>
              </div>
              <div style={{ height: 20 }} />
            </>
          )}

          {page === "account" && <AccountPage user={user} />}
          {page === "push" && <PushPage push={push} />}
          {page === "appearance" && <AppearancePage dark={dark} onToggle={toggle} />}
          {page === "location" && <LocationPage tracking={tracking} />}
        </div>
      </div>
    </div>
  );
}

/** What the avatar opens for someone browsing without an account. */
function GuestSheet({ onClose, dark, onToggleDark }) {
  const navigate = useNavigate();
  const go = (to) => {
    onClose();
    navigate(to);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="overlay-sheet" onClick={(e) => e.stopPropagation()}>
        <div style={{ flexShrink: 0 }}>
          <div className="handle" style={{ margin: "10px auto 0" }} />
          <div style={{ padding: "12px 20px 14px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.4px" }}>
              Browsing as guest
            </div>
          </div>
        </div>

        <div className="overlay-body">
          <div style={{ padding: "16px 16px 24px" }}>
            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>
                You have full access to the map
              </div>
              <p style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.6, marginBottom: 14 }}>
                Track buses, browse routes, check live arrival times and read what other riders have
                reported — no account needed. An account adds arrival alerts and lets you file reports.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => go("/register")}>
                  Create account
                </button>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => go("/login")}>
                  Sign in
                </button>
              </div>
            </div>

            <div className="card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ color: "var(--muted)", display: "flex" }}>
                <IconMoon />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Dark mode</div>
                <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{dark ? "On" : "Off"}</div>
              </div>
              <Toggle on={dark} onChange={onToggleDark} label="Dark mode" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountPage({ user }) {
  const rows = [
    ["Username", user.username],
    ["Email", user.email || "—"],
    ["Phone", user.phone || "—"],
    ...(user.role === "driver" ? [["License number", user.license_no || "—"]] : []),
  ];

  return (
    <div style={{ padding: "14px 16px 24px" }}>
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#15803d,#16a34a)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            {user.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text)" }}>{user.username}</div>
            <div style={{ marginTop: 4 }}>
              <RoleBadge role={user.role} />
            </div>
          </div>
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
            <span style={{ fontWeight: 600, color: "var(--text)", textAlign: "right" }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PushPage({ push }) {
  return (
    <div style={{ padding: "14px 16px 24px" }}>
      <div className="card">
        <div className="card-title">
          <IconBell c="var(--brand)" /> Arrival & delay alerts
        </div>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 14 }}>
          Get a browser notification when a bus you're tracking is almost at your stop, or when it's
          running behind schedule. Set the alerts themselves from any bus page.
        </p>

        {push.error && <div className="alert alert-error">{push.error}</div>}
        {!push.supported && !push.loading && (
          <div className="alert alert-error">This browser doesn't support push notifications.</div>
        )}

        {push.supported && (
          <button
            className={`btn btn-lg ${push.enabled ? "btn-danger" : "btn-primary"}`}
            disabled={push.loading}
            onClick={push.enabled ? push.disable : push.enable}
          >
            {push.loading ? "Checking…" : push.enabled ? "Turn off notifications" : "Enable notifications"}
          </button>
        )}
      </div>
    </div>
  );
}

/** The "Settings" the location consent screen points riders back to. */
function LocationPage({ tracking }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleToggle(next) {
    setError("");
    if (!next) {
      tracking.disable();
      return;
    }
    setBusy(true);
    try {
      await tracking.enable();
    } catch (err) {
      setError(err.message || "Could not turn on location tracking.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: "14px 16px 24px" }}>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ color: "var(--muted)", display: "flex" }}>
          <IconLocation />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Location tracking</div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
            {busy ? "Waiting for permission…" : tracking.on ? "On" : "Off"}
          </div>
        </div>
        <Toggle on={tracking.on} onChange={handleToggle} label="Location tracking" />
      </div>

      <div style={{ padding: "16px 4px", display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          "Your location is used to verify you are on the bus when submitting reports.",
          "Without tracking you can still view routes, plan trips, and set alerts.",
          "Your location is never stored or shared with third parties.",
        ].map((point) => (
          <div key={point} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
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
            <span style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.55 }}>{point}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppearancePage({ dark, onToggle }) {
  return (
    <div style={{ padding: "14px 16px 24px" }}>
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ color: "var(--muted)", display: "flex" }}>
          <IconMoon />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Dark mode</div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{dark ? "On" : "Off"}</div>
        </div>
        <Toggle on={dark} onChange={onToggle} label="Dark mode" />
      </div>
      <p style={{ fontSize: 12, color: "var(--muted)", padding: "12px 4px", lineHeight: 1.6 }}>
        Dark mode also switches the map to a low-light basemap so it stays readable at night.
      </p>
    </div>
  );
}
