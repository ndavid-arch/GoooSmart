import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../api/client";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const me = await login(form.username, form.password);
      const from = location.state?.from;
      if (from) navigate(from, { replace: true });
      else if (me.role === "driver") navigate("/driver", { replace: true });
      else if (me.role === "admin") navigate("/admin", { replace: true });
      else navigate("/app", { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, "Invalid username or password."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 420 }}>
      <div className="card">
        <h2 style={{ color: "var(--blue-900)", marginBottom: 4 }}>Welcome back</h2>
        <p style={{ color: "var(--gray-600)", fontSize: 14, marginBottom: 20 }}>
          Log in to track buses along the Kimironko corridor.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Username</label>
            <input
              autoFocus
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p style={{ marginTop: 16, fontSize: 13.5, color: "var(--gray-600)" }}>
          New to GoSmart? <Link to="/register" style={{ color: "var(--blue-600)", fontWeight: 700 }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}
