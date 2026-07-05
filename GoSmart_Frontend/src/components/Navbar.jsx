import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { RoleBadge } from "./Badges";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const linkStyle = ({ isActive }) => ({
    padding: "8px 14px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    color: isActive ? "var(--blue-700)" : "var(--gray-600)",
    background: isActive ? "var(--blue-50)" : "transparent",
  });

  return (
    <header
      style={{
        background: "var(--white)",
        borderBottom: "1px solid var(--gray-100)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div className="navbar-inner">
        <NavLink to="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "linear-gradient(135deg, var(--blue-600), var(--green-600))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            🚌
          </span>
          <span style={{ fontWeight: 800, fontSize: 18, color: "var(--blue-900)" }}>
            Go<span style={{ color: "var(--green-600)" }}>Smart</span>
          </span>
        </NavLink>

        <nav className="navbar-links">
          {user && user.role !== "driver" && (
            <NavLink to="/app" style={linkStyle} end>
              Live Map
            </NavLink>
          )}
          {user && user.role !== "driver" && (
            <NavLink to="/app/reports" style={linkStyle}>
              Traffic Reports
            </NavLink>
          )}
          {user?.role === "driver" && (
            <NavLink to="/driver" style={linkStyle}>
              My Bus
            </NavLink>
          )}
          {user?.role === "admin" && (
            <NavLink to="/admin" style={linkStyle}>
              Admin Panel
            </NavLink>
          )}
          {user && (
            <NavLink to="/app/profile" style={linkStyle}>
              Profile
            </NavLink>
          )}
        </nav>

        <div className="navbar-actions" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {user ? (
            <>
              <RoleBadge role={user.role} />
              <span className="navbar-username" style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-800)" }}>
                {user.username}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn btn-ghost btn-sm">
                Log in
              </NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm">
                Sign up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
