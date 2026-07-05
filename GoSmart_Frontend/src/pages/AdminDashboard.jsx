import { useState } from "react";
import StopsPanel from "../components/admin/StopsPanel";
import RoutesPanel from "../components/admin/RoutesPanel";
import RouteStopsPanel from "../components/admin/RouteStopsPanel";
import BusesPanel from "../components/admin/BusesPanel";

const TABS = [
  { key: "routes", label: "🗺️ Routes" },
  { key: "stops", label: "🚏 Stops" },
  { key: "linking", label: "🔗 Route ↔ Stops" },
  { key: "buses", label: "🚌 Buses" },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("routes");

  return (
    <div className="page">
      <h2 style={{ color: "var(--blue-900)", fontSize: 22, marginBottom: 4 }}>Admin Panel</h2>
      <p style={{ color: "var(--gray-600)", fontSize: 14, marginBottom: 18 }}>
        Manage routes, stops, buses, and driver assignments.
      </p>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="btn btn-sm"
            style={{
              background: tab === t.key ? "var(--blue-600)" : "var(--white)",
              color: tab === t.key ? "var(--white)" : "var(--gray-600)",
              border: "1px solid " + (tab === t.key ? "var(--blue-600)" : "var(--gray-200)"),
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "routes" && <RoutesPanel />}
      {tab === "stops" && <StopsPanel />}
      {tab === "linking" && <RouteStopsPanel />}
      {tab === "buses" && <BusesPanel />}
    </div>
  );
}
