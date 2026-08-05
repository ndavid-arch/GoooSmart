import { useState } from "react";
import { usePolling } from "../../hooks/usePolling";
import { trafficReportsApi } from "../../api/community";
import { apiErrorMessage } from "../../api/client";
import { SeverityBadge } from "../Badges";
import Loading, { EmptyState } from "../Loading";
import { Chips, GuestGate, Sheet } from "../Ui";
import { IconCheck, IconCone, IconFlag } from "../Icons";
import { useAuth } from "../../context/AuthContext";

const FILTERS = [
  { value: "", label: "All" },
  { value: "light", label: "Light" },
  { value: "moderate", label: "Moderate" },
  { value: "heavy", label: "Heavy" },
];

const SEVERITIES = [
  { value: "light", label: "Light", color: "var(--brand)", tint: "var(--ok-tint)" },
  { value: "moderate", label: "Moderate", color: "var(--warn)", tint: "var(--warn-tint)" },
  { value: "heavy", label: "Heavy", color: "var(--danger)", tint: "var(--danger-tint)" },
];

/** Congestion reported by riders around the city. */
export default function TrafficSection() {
  const { user } = useAuth();
  const [severity, setSeverity] = useState("");
  const { data: reports, loading, refetch } = usePolling(
    () => trafficReportsApi.list(severity || undefined),
    10000,
    [severity]
  );

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ location: "", severity: "moderate" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await trafficReportsApi.create(form);
      setDone(true);
      refetch();
      setTimeout(() => {
        setOpen(false);
        setDone(false);
        setForm({ location: "", severity: "moderate" });
      }, 1600);
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
    <>
      <Chips options={FILTERS} value={severity} onChange={setSeverity} scroll />

      <div className="page stack">
        {user ? (
          <button className="btn btn-primary btn-lg" onClick={() => setOpen(true)}>
            <IconFlag c="#fff" /> Report traffic
          </button>
        ) : (
          <GuestGate title="Sign in to report traffic">
            Anyone can read what riders have flagged. Filing a report needs an account so it can be
            attributed and reviewed.
          </GuestGate>
        )}

        {loading && !reports && <Loading label="Loading reports…" />}

        {(reports || []).map((r) => (
          <div key={r.id} className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="row-title">{r.location}</div>
              <div className="row-sub">
                {r.username} · {new Date(r.created_at).toLocaleString()}
              </div>
            </div>
            <SeverityBadge severity={r.severity} />
            {user?.role === "admin" && (
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>
                Delete
              </button>
            )}
          </div>
        ))}

        {reports && reports.length === 0 && (
          <EmptyState
            icon={<IconCone size={26} c="var(--dim)" />}
            title="No traffic reports"
            hint="All clear for now."
          />
        )}
      </div>

      {open && (
        <Sheet title="Report traffic" subtitle="Tell other riders what you're seeing" onClose={() => setOpen(false)}>
          {done ? (
            <div style={{ padding: 48, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "var(--brand-tint)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconCheck size={30} c="var(--brand)" />
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>Report submitted</div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>Thank you for helping the community.</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ padding: 20 }}>
              {error && <div className="alert alert-error">{error}</div>}

              <div className="card-label">How bad is it?</div>
              <div className="choice-grid" style={{ marginBottom: 20 }}>
                {SEVERITIES.map((s) => {
                  const active = form.severity === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      className="choice"
                      onClick={() => setForm({ ...form, severity: s.value })}
                      style={
                        active
                          ? { border: `2px solid ${s.color}`, background: s.tint, color: s.color, padding: 12 }
                          : undefined
                      }
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>

              <div className="field">
                <label>Where?</label>
                <input
                  autoFocus
                  placeholder="e.g. Kimironko junction"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
              </div>

              <button className="btn btn-primary btn-lg" disabled={submitting || !form.location.trim()}>
                {submitting ? "Submitting…" : "Submit report"}
              </button>
            </form>
          )}
        </Sheet>
      )}
    </>
  );
}
