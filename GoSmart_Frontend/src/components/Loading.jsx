import { IconStop } from "./Icons";

export default function Loading({ label = "Loading..." }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "24px 0", color: "var(--muted)", fontSize: 13.5 }}>
      <div className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ icon = <IconStop size={26} c="var(--dim)" />, title = "Nothing here yet", hint }) {
  return (
    <div className="empty-state">
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: "var(--surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          margin: "0 auto 12px",
        }}
      >
        {icon}
      </div>
      <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 14.5 }}>{title}</div>
      {hint && <div style={{ fontSize: 12.5, marginTop: 5, color: "var(--muted)", lineHeight: 1.5 }}>{hint}</div>}
    </div>
  );
}
