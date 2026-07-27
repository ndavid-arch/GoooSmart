import { useCallback, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import BottomNav from "./components/BottomNav";
import ProtectedRoute from "./components/ProtectedRoute";
import Splash from "./components/Splash";
import { useAuth } from "./context/AuthContext";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Consent from "./pages/Consent";
import PassengerDashboard from "./pages/PassengerDashboard";
import RoutesScreen from "./pages/RoutesScreen";
import AlertsScreen from "./pages/AlertsScreen";
import RouteDetail from "./pages/RouteDetail";
import BusDetail from "./pages/BusDetail";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import DriverDashboard from "./pages/DriverDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const SPLASH_KEY = "gosmart_splash_shown";

function App() {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  const [splashDone, setSplashDone] = useState(
    () => typeof sessionStorage !== "undefined" && sessionStorage.getItem(SPLASH_KEY) === "1"
  );

  const finishSplash = useCallback(() => {
    sessionStorage.setItem(SPLASH_KEY, "1");
    setSplashDone(true);
  }, []);

  // The admin panel is a management tool — let it use the full window width.
  const wide = pathname.startsWith("/admin");

  // Drivers get a single dedicated screen; everyone else — guests included —
  // navigates by tab bar.
  const showNav = user?.role !== "driver" && (pathname.startsWith("/app") || pathname.startsWith("/admin"));

  if (!splashDone || loading) {
    return <Splash onDone={finishSplash} />;
  }

  return (
    <div className={`app-frame ${wide ? "is-wide" : ""}`}>
      <div className="app-body">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/consent"
            element={
              <ProtectedRoute>
                <Consent />
              </ProtectedRoute>
            }
          />

          {/* Browsing is open to guests — the API serves routes, buses, ETAs
              and community reports without an account. Anything that writes, or
              keeps a record, stays behind ProtectedRoute. */}
          <Route path="/app" element={<PassengerDashboard />} />
          <Route path="/app/routes" element={<RoutesScreen />} />
          <Route path="/app/routes/:id" element={<RouteDetail />} />
          <Route path="/app/buses/:id" element={<BusDetail />} />
          <Route path="/app/reports" element={<Reports />} />
          <Route path="/app/alerts" element={<AlertsScreen />} />
          <Route
            path="/app/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/driver"
            element={
              <ProtectedRoute roles={["driver"]}>
                <DriverDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {showNav && <BottomNav role={user?.role} />}
    </div>
  );
}

export default App;
