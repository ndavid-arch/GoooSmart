export function LiveBadge({ live }) {
  return live ? (
    <span className="badge badge-green">
      <span className="dot dot-live" style={{ background: "var(--brand)" }} /> Live
    </span>
  ) : (
    <span className="badge badge-gray">
      <span className="dot" style={{ background: "var(--dim)" }} /> Offline
    </span>
  );
}

const SEVERITY_STYLES = {
  light: "badge-green",
  moderate: "badge-yellow",
  heavy: "badge-red",
};

export function SeverityBadge({ severity }) {
  return (
    <span className={`badge ${SEVERITY_STYLES[severity] || "badge-gray"}`}>
      {severity ? severity[0].toUpperCase() + severity.slice(1) : "Unknown"}
    </span>
  );
}

export function RoleBadge({ role }) {
  const styles = { admin: "badge-blue", driver: "badge-yellow", passenger: "badge-green" };
  return <span className={`badge ${styles[role] || "badge-gray"}`}>{role}</span>;
}
