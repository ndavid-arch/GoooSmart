export default function Loading({ label = "Loading..." }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "24px 0", color: "var(--gray-600)" }}>
      <div className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ icon = "🚏", title = "Nothing here yet", hint }) {
  return (
    <div className="empty-state">
      <div style={{ fontSize: 34, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontWeight: 700, color: "var(--gray-600)" }}>{title}</div>
      {hint && <div style={{ fontSize: 13, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}
