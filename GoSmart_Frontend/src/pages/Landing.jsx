import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  {
    icon: "📍",
    title: "Live Bus Tracking",
    text: "See real-time GPS locations of buses on the Kimironko corridor, refreshed every few seconds.",
    color: "var(--blue-600)",
  },
  {
    icon: "⏱️",
    title: "ETA Prediction",
    text: "Get an estimated arrival time to your stop based on a bus's last known position.",
    color: "var(--green-600)",
  },
  {
    icon: "⭐",
    title: "Cleanliness & Safety Ratings",
    text: "Rate your ride and see average scores before you board.",
    color: "var(--yellow-600)",
  },
  {
    icon: "🚧",
    title: "Traffic Reports",
    text: "Riders flag congestion in real time so everyone can plan around it.",
    color: "var(--blue-600)",
  },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div>
      <section
        style={{
          background: "linear-gradient(180deg, var(--blue-50) 0%, var(--white) 100%)",
          borderBottom: "1px solid var(--gray-100)",
        }}
      >
        <div className="page" style={{ textAlign: "center", paddingTop: 64, paddingBottom: 56 }}>
          <span className="badge badge-green" style={{ marginBottom: 18 }}>
            Built for the Kimironko corridor, Kigali
          </span>
          <h1 style={{ fontSize: 42, color: "var(--blue-900)", fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>
            Know exactly when your <span style={{ color: "var(--green-600)" }}>bus</span> arrives.
          </h1>
          <p style={{ maxWidth: 560, margin: "0 auto 28px", color: "var(--gray-600)", fontSize: 16 }}>
            GoSmart shows live bus locations, predicts arrival times, and lets riders report
            cleanliness, safety, and traffic — all in one place.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            {user ? (
              <Link to="/app" className="btn btn-primary" style={{ padding: "12px 26px", fontSize: 15 }}>
                Open Live Map
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary" style={{ padding: "12px 26px", fontSize: 15 }}>
                  Get started free
                </Link>
                <Link to="/login" className="btn btn-ghost" style={{ padding: "12px 26px", fontSize: 15 }}>
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="page">
        <div className="grid-auto">
          {FEATURES.map((f) => (
            <div key={f.title} className="card">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "var(--gray-50)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  marginBottom: 12,
                }}
              >
                {f.icon}
              </div>
              <h3 style={{ fontSize: 16, color: "var(--blue-900)", marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: 13.5, color: "var(--gray-600)", lineHeight: 1.5 }}>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page" style={{ paddingTop: 0 }}>
        <div
          className="card"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            background: "linear-gradient(135deg, var(--blue-600), var(--green-600))",
            border: "none",
          }}
        >
          <div>
            <h3 style={{ color: "var(--white)", fontSize: 20, marginBottom: 6 }}>
              The problem: no reliable way to know when the next bus arrives.
            </h3>
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 14, maxWidth: 520 }}>
              That gap pushes commuters toward taxi-motos — faster, but more expensive and
              linked to the majority of road accidents. GoSmart closes that gap.
            </p>
          </div>
          <Link to={user ? "/app" : "/register"} className="btn btn-accent" style={{ padding: "12px 22px" }}>
            {user ? "View live buses" : "Join GoSmart"}
          </Link>
        </div>
      </section>
    </div>
  );
}
