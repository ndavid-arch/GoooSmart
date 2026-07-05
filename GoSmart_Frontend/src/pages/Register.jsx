import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../api/client";

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

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await register(form);
      if (user.role === "driver") navigate("/driver", { replace: true });
      else navigate("/app", { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, "Could not create your account. Please check the fields below."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 460 }}>
      <div className="card">
        <h2 style={{ color: "var(--blue-900)", marginBottom: 4 }}>Create your account</h2>
        <p style={{ color: "var(--gray-600)", fontSize: 14, marginBottom: 20 }}>
          Join GoSmart as a passenger or a driver.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>I am a...</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="passenger">Passenger</option>
              <option value="driver">Driver</option>
            </select>
          </div>
          <div className="field">
            <label>Username</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Phone (optional)</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          {form.role === "driver" && (
            <div className="field">
              <label>License number</label>
              <input
                value={form.license_no}
                onChange={(e) => setForm({ ...form, license_no: e.target.value })}
              />
            </div>
          )}
          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p style={{ marginTop: 16, fontSize: 13.5, color: "var(--gray-600)" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--blue-600)", fontWeight: 700 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
