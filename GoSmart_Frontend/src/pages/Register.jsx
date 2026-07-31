import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../api/client";
import { ScreenHead } from "../components/Ui";
import { IconBus, IconShield, IconUser } from "../components/Icons";

const ROLES = [
  { value: "passenger", label: "Passenger", Icon: IconUser },
  { value: "driver", label: "Driver", Icon: IconBus },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "passenger",
    phone: "",
    license_no: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const valid = form.username.trim().length > 1 && form.password.length >= 6;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await register(form);
      // Location consent comes next — it is where drivers turn on GPS sharing.
      navigate("/consent", { replace: true, state: { role: user.role } });
    } catch (err) {
      setError(apiErrorMessage(err, "Could not create your account. Please check the fields below."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <ScreenHead title="Create account" onBack={() => navigate("/")} />

      <form onSubmit={handleSubmit} style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }} className="animate-in">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="field">
            <label>I am a</label>
            <div className="choice-grid">
              {ROLES.map((r) => {
                const active = form.role === r.value;
                return (
                  <button
                    type="button"
                    key={r.value}
                    className={`choice ${active ? "is-active" : ""}`}
                    onClick={() => setForm({ ...form, role: r.value })}
                  >
                    <r.Icon size={16} c={active ? "var(--brand)" : "var(--dim)"} />
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="field">
            <label>Username</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="e.g. amina"
              autoComplete="username"
              required
            />
          </div>
          <div className="field">
            <label>Email address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="amina@example.com"
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              required
            />
          </div>
          <div className="field">
            <label>
              Phone <span style={{ fontWeight: 400, color: "var(--dim)" }}>(optional)</span>
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+250 …"
              autoComplete="tel"
            />
          </div>

          {form.role === "driver" && (
            <>
              <div className="field">
                <label>License number</label>
                <input
                  value={form.license_no}
                  onChange={(e) => setForm({ ...form, license_no: e.target.value })}
                  placeholder="RW-000000"
                />
              </div>
              <div
                style={{
                  background: "var(--surface)",
                  border: "1.5px solid var(--border)",
                  borderRadius: "var(--r-md)",
                  padding: 14,
                  display: "flex",
                  gap: 10,
                }}
              >
                <span style={{ color: "var(--muted)", flexShrink: 0 }}>
                  <IconShield />
                </span>
                <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
                  As a driver, the next step asks you to allow location sharing. Your phone's GPS becomes
                  this bus's live position for passengers.
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{ padding: "16px 20px 28px", borderTop: "1px solid var(--border)" }}>
          <button className="btn btn-primary btn-lg" disabled={busy || !valid}>
            {busy ? "Creating account…" : "Continue"}
          </button>
          <p style={{ marginTop: 16, fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--brand)", fontWeight: 700 }}>
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
