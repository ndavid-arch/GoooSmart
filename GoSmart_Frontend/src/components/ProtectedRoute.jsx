import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "./Loading";

/** Where a signed-in user belongs when they hit a screen their role can't use. */
function homeFor(role) {
  if (role === "driver") return "/driver";
  if (role === "admin") return "/admin";
  return "/app";
}

export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="screen">
        <div className="page">
          <Loading label="Checking your session..." />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    const home = homeFor(user.role);
    // Guard against redirecting a screen back onto itself.
    return <Navigate to={home === location.pathname ? "/" : home} replace />;
  }

  return children;
}
