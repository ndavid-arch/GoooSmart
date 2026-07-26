import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { routeColor, routeLabel } from "../utils/route";
import { IconBack, IconUser, IconX } from "./Icons";

/** Transit-style coloured route chip. */
export function RouteBadge({ route, size = "sm", color }) {
  if (!route) return null;
  return (
    <span className={`route-badge ${size}`} style={{ background: color || routeColor(route.id ?? route.route) }}>
      {routeLabel(route)}
    </span>
  );
}

/** Header with a back affordance, used on every pushed screen. */
export function ScreenHead({ title, onBack, right }) {
  return (
    <div className="screen-head">
      {onBack && (
        <button className="icon-btn" onClick={onBack} aria-label="Go back">
          <IconBack />
        </button>
      )}
      <h2>{title}</h2>
      {right}
    </div>
  );
}

/** Modal bottom sheet. Locks background scroll and closes on backdrop tap. */
export function Sheet({ title, subtitle, onClose, children, center = false }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (center) {
    return (
      <div className="overlay overlay-center" onClick={onClose}>
        <div className="overlay-dialog" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="overlay-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-head">
          <div className="handle" style={{ marginBottom: 10 }} />
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.4px" }}>{title}</div>
              {subtitle && <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 3 }}>{subtitle}</div>}
            </div>
            <button className="icon-btn icon-btn-round" onClick={onClose} aria-label="Close">
              <IconX />
            </button>
          </div>
        </div>
        <div className="overlay-body">{children}</div>
      </div>
    </div>
  );
}

/** Segmented pill row (severity filters, admin tabs, alert timings…). */
export function Chips({ options, value, onChange, scroll = false }) {
  return (
    <div className={scroll ? "chip-scroll" : "chip-row"}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`chip ${String(o.value) === String(value) ? "is-active" : ""}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ on, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`switch ${on ? "is-on" : ""}`}
      onClick={() => onChange(!on)}
    />
  );
}

/**
 * Shown in place of an action a guest can't take. Guests can browse everything;
 * anything that files a report or keeps a record needs an account.
 */
export function GuestGate({ title, children, compact = false }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="card" style={{ textAlign: "center" }}>
      {!compact && (
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "var(--surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 12px",
            color: "var(--dim)",
          }}
        >
          <IconUser size={26} c="var(--dim)" />
        </div>
      )}
      <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>{title}</div>
      {children && (
        <p style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.6, margin: "6px 0 14px" }}>{children}</p>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          className="btn btn-primary"
          style={{ flex: 1 }}
          onClick={() => navigate("/register", { state: { from: pathname } })}
        >
          Create account
        </button>
        <button
          className="btn btn-ghost"
          style={{ flex: 1 }}
          onClick={() => navigate("/login", { state: { from: pathname } })}
        >
          Sign in
        </button>
      </div>
    </div>
  );
}

/** Section heading inside a scrolling screen. */
export function SectionLabel({ children, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 8px" }}>
      <div className="card-label" style={{ marginBottom: 0 }}>
        {children}
      </div>
      {action}
    </div>
  );
}