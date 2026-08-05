import { useState } from "react";
import StopsPanel from "../components/admin/StopsPanel";
import RoutesPanel from "../components/admin/RoutesPanel";
import RouteStopsPanel from "../components/admin/RouteStopsPanel";
import BusesPanel from "../components/admin/BusesPanel";
import ProfileSheet from "../components/ProfileSheet";
import { Chips } from "../components/Ui";
import { IconUser } from "../components/Icons";

const TABS = [
  { value: "routes", label: "Routes" },
  { value: "stops", label: "Stops" },
  { value: "linking", label: "Route ↔ Stops" },
  { value: "buses", label: "Buses" },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("routes");
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      <div className="screen">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "16px 20px 0" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.5px" }}>Admin panel</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
              Manage routes, stops, buses, and driver assignments.
            </div>
          </div>
          <button className="avatar-btn" onClick={() => setProfileOpen(true)} aria-label="Open profile" style={{ width: 40, height: 40 }}>
            <IconUser c="#ffffff" size={18} />
          </button>
        </div>

        <div style={{ padding: "14px 0 0" }}>
          <Chips options={TABS} value={tab} onChange={setTab} scroll />
        </div>

        <div className="page page-wide">
          {tab === "routes" && <RoutesPanel />}
          {tab === "stops" && <StopsPanel />}
          {tab === "linking" && <RouteStopsPanel />}
          {tab === "buses" && <BusesPanel />}
        </div>
      </div>

      {profileOpen && <ProfileSheet onClose={() => setProfileOpen(false)} />}
    </>
  );
}
