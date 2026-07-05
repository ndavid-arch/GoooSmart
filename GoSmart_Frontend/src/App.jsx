import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PassengerDashboard from "./pages/PassengerDashboard";
import RouteDetail from "./pages/RouteDetail";
import BusDetail from "./pages/BusDetail";
import TrafficReports from "./pages/TrafficReports";
import Profile from "./pages/Profile";
import DriverDashboard from "./pages/DriverDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/app"
            element={
              <ProtectedRoute roles={["passenger", "admin"]}>
                <PassengerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/routes/:id"
            element={
              <ProtectedRoute roles={["passenger", "admin"]}>
                <RouteDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/buses/:id"
            element={
              <ProtectedRoute roles={["passenger", "admin"]}>
                <BusDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/reports"
            element={
              <ProtectedRoute roles={["passenger", "admin"]}>
                <TrafficReports />
              </ProtectedRoute>
            }
          />
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
      </main>
    </div>
  );
}

export default App;
