import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="page" style={{ textAlign: "center", paddingTop: 80 }}>
      <div style={{ fontSize: 46, marginBottom: 10 }}>🚏</div>
      <h2 style={{ color: "var(--blue-900)", marginBottom: 8 }}>This stop doesn't exist</h2>
      <p style={{ color: "var(--gray-600)", marginBottom: 20 }}>The page you're looking for isn't on the map.</p>
      <Link to="/" className="btn btn-primary">
        Back to home
      </Link>
    </div>
  );
}
