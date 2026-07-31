import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../api/client";
import { ScreenHead } from "../components/Ui";
import { greeting } from "../utils/route";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const valid = form.username.trim() && form.password;

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
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <ScreenHead title="Sign in" onBack={() => navigate("/")} />

      <form onSubmit={handleSubmit} style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }} className="animate-in">
          <div style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.6px" }}>
            {greeting()}
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, marginBottom: 24 }}>
            Sign in to track buses in Kigali.
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="field">
            <label>Username</label>
            <input
              autoFocus
              autoComplete="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="e.g. amina"
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Your password"
              required
            />
          </div>
        </div>

        <div style={{ padding: "16px 20px 28px", borderTop: "1px solid var(--border)" }}>
          <button className="btn btn-primary btn-lg" disabled={busy || !valid}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <p style={{ marginTop: 16, fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
            New to GoSmart?{" "}
            <Link to="/register" style={{ color: "var(--brand)", fontWeight: 700 }}>
              Create an account
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
