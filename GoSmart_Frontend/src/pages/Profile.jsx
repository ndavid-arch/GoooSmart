import { useAuth } from "../context/AuthContext";
import { RoleBadge } from "../components/Badges";

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  const rows = [
    ["Username", user.username],
    ["Email", user.email || "—"],
    ["Phone", user.phone || "—"],
    ...(user.role === "driver" ? [["License number", user.license_no || "—"]] : []),
  ];

  return (
    <div className="page" style={{ maxWidth: 520 }}>
      <h2 style={{ color: "var(--blue-900)", fontSize: 22, marginBottom: 18 }}>My Profile</h2>
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--blue-600), var(--green-600))",
              color: "var(--white)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            {user.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>{user.username}</div>
            <RoleBadge role={user.role} />
          </div>
        </div>

        {rows.map(([label, value]) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid var(--gray-100)",
              fontSize: 14,
            }}
          >
            <span style={{ color: "var(--gray-600)" }}>{label}</span>
            <span style={{ fontWeight: 600 }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
