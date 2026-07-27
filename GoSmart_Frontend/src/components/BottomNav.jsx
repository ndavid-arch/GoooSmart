import { useLocation, useNavigate } from "react-router-dom";
import { TabAdmin, TabAlerts, TabMap, TabReports, TabRoutes } from "./Icons";

const PASSENGER_TABS = [
  { to: "/app", label: "Map", Icon: TabMap, exact: true },
  { to: "/app/routes", label: "Routes", Icon: TabRoutes },
  { to: "/app/alerts", label: "Alerts", Icon: TabAlerts },
  { to: "/app/reports", label: "Reports", Icon: TabReports },
];

const ADMIN_TAB = { to: "/admin", label: "Admin", Icon: TabAdmin };

export default function BottomNav({ role }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const tabs = role === "admin" ? [...PASSENGER_TABS, ADMIN_TAB] : PASSENGER_TABS;

  const isActive = (tab) => {
    if (tab.exact) return pathname === tab.to || pathname.startsWith("/app/buses");
    return pathname === tab.to || pathname.startsWith(`${tab.to}/`);
  };

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const active = isActive(tab);
        return (
          <button
            key={tab.to}
            className={`nav-item ${active ? "is-active" : ""}`}
            onClick={() => navigate(tab.to)}
            aria-current={active ? "page" : undefined}
          >
            <tab.Icon active={active} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
