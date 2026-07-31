import { useNavigate } from "react-router-dom";
import { LogoMark } from "../components/Icons";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="screen">
      <div className="page" style={{ textAlign: "center", paddingTop: 90 }}>
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: 22,
            background: "var(--brand-tint)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 18px",
          }}
        >
          <LogoMark size={42} bg="var(--brand-tint)" fg="#16a34a" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>This stop doesn't exist</h2>
        <p style={{ color: "var(--muted)", marginBottom: 22, fontSize: 13.5 }}>
          The page you're looking for isn't on the map.
        </p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate("/")}>
          Back to the map
        </button>
      </div>
    </div>
  );
}
