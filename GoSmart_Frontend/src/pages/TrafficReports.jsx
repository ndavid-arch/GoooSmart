import { useState } from "react";
import { usePolling } from "../hooks/usePolling";
import { trafficReportsApi } from "../api/community";
import { apiErrorMessage } from "../api/client";
import { SeverityBadge } from "../components/Badges";
import Loading, { EmptyState } from "../components/Loading";
import { useAuth } from "../context/AuthContext";

export default function TrafficReports() {
  const { user } = useAuth();
  const [severity, setSeverity] = useState("");
  const { data: reports, loading, refetch } = usePolling(
    () => trafficReportsApi.list(severity || undefined),
    10000,
    [severity]
  );

  const [form, setForm] = useState({ location: "", severity: "moderate" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await trafficReportsApi.create(form);
      setSuccess("Traffic report submitted. Thanks for helping other riders!");
      setForm({ location: "", severity: "moderate" });
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not submit this report."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this traffic report?")) return;
    await trafficReportsApi.remove(id);
    refetch();
  }

  return (
    <div className="page">
      <h2 style={{ color: "var(--blue-900)", fontSize: 22, marginBottom: 4 }}>Traffic Reports</h2>
      <p style={{ color: "var(--gray-600)", fontSize: 14, marginBottom: 20 }}>
        Riders flag congestion on the corridor in real time.
      </p>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>
              Recent reports
            </div>
            <select value={severity} onChange={(e) => setSeverity(e.target.value)} style={{ maxWidth: 160 }}>
              <option value="">All severities</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="heavy">Heavy</option>
            </select>
          </div>

          {loading && !reports && <Loading label="Loading reports..." />}
          {reports && reports.length === 0 && <EmptyState icon="🚧" title="No traffic reports" hint="All clear for now." />}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(reports || []).map((r) => (
              <div
                key={r.id}
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "var(--gray-50)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{r.location}</div>
                  <div style={{ fontSize: 12, color: "var(--gray-400)" }}>
                    reported by {r.username} · {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <SeverityBadge severity={r.severity} />
                  {user?.role === "admin" && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">📢 Report traffic</div>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Location</label>
              <input
                placeholder="e.g. Kimironko junction"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Severity</label>
              <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="heavy">Heavy</option>
              </select>
            </div>
            <button className="btn btn-accent btn-block" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit report"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
