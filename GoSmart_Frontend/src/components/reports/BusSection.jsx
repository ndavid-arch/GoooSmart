import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePolling } from "../../hooks/usePolling";
import { busReportsApi } from "../../api/community";
import { apiErrorMessage } from "../../api/client";
import Loading, { EmptyState } from "../Loading";
import { Chips, GuestGate, RouteBadge, Sheet } from "../Ui";
import { IconBus, IconCheck, IconFlag, IconLocation } from "../Icons";
import { useAuth } from "../../context/AuthContext";
import { DIMENSIONS, LEVEL_STYLE, flaggedDimensions, levelLabel } from "../../utils/busReports";
import { useTracking } from "../../hooks/useTracking";

const FILTERS = [{ value: "", label: "All" }, ...DIMENSIONS.map((d) => ({ value: d.key, label: d.label }))];

const BLANK = { bus: "", cleanliness: "", crowding: "", driving: "", comment: "" };

export default function BusSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");

  const { data: reports, loading, refetch } = usePolling(() => busReportsApi.list(), 10000);
  const { data: boardable } = usePolling(() => busReportsApi.boardable(), 30000);

  const tracking = useTracking();
  const [trackingError, setTrackingError] = useState("");
  const [enabling, setEnabling] = useState(false);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const rideable = boardable?.buses || [];
  const canReport = rideable.length > 0;
  const windowHours = Math.round((boardable?.window_minutes ?? 180) / 60);

  const visible = (reports || []).filter((r) => !filter || r[filter]);

  async function enableTracking() {
    setTrackingError("");
    setEnabling(true);
    try {
      await tracking.enable();
    } catch (err) {
      setTrackingError(err.message || "Could not turn on location tracking.");
    } finally {
      setEnabling(false);
    }
  }

  function startReport() {
    setForm({ ...BLANK, bus: rideable.length === 1 ? rideable[0].bus : "" });
    setError("");
    setOpen(true);
  }

  /** Tapping the chosen level again clears it, so a dimension stays skippable. */
  function pick(dimension, value) {
    setForm((f) => ({ ...f, [dimension]: f[dimension] === value ? "" : value }));
  }

  const flagged = DIMENSIONS.some((d) => form[d.key]);
  const ready = flagged && form.bus;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await busReportsApi.create({ ...form, bus: Number(form.bus) });
      setDone(true);
      refetch();
      setTimeout(() => {
        setOpen(false);
        setDone(false);
        setForm(BLANK);
      }, 1600);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not submit this report."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this bus report?")) return;
    await busReportsApi.remove(id);
    refetch();
  }

  return (
    <>
      <Chips options={FILTERS} value={filter} onChange={setFilter} scroll />

      <div className="page stack">
        {!user ? (
          <GuestGate title="Sign in to report a bus">
            Anyone can read what riders have flagged. Reporting needs an account, because we verify you
            are actually on the bus first.
          </GuestGate>
        ) : !tracking.on ? (
          /* Reports are location-verified, so tracking has to be on first. */
          <div className="card" style={{ textAlign: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "var(--surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
                color: "var(--dim)",
              }}
            >
              <IconLocation size={26} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>Location Required</div>
            <p style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.6, margin: "6px 0 14px" }}>
              Enable location tracking to submit reports. You need to be on the bus for your report to be
              verified.
            </p>
            {trackingError && <div className="alert alert-error">{trackingError}</div>}
            <button className="btn btn-primary btn-block" disabled={enabling} onClick={enableTracking}>
              {enabling ? "Waiting for permission…" : "Enable location tracking"}
            </button>
          </div>
        ) : canReport ? (
          <button className="btn btn-primary btn-lg" onClick={startReport}>
            <IconFlag c="#fff" /> Report this bus
          </button>
        ) : (
          <div className="card" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ color: "var(--dim)", flexShrink: 0, marginTop: 2 }}>
              <IconLocation />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Only riders on board can report</div>
              <p style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.6, margin: "4px 0 12px" }}>
                Open the bus you're riding and tap <strong>I'm on this bus</strong>. You can then report it for
                the next {windowHours} hours.
              </p>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/app")}>
                Find my bus
              </button>
            </div>
          </div>
        )}

        {loading && !reports && <Loading label="Loading bus reports…" />}

        {visible.map((r) => (
          <div key={r.id} className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <RouteBadge route={{ id: r.route, route_number: r.route_number, route_name: r.route_name }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row-title">{r.route_name || r.bus_plate}</div>
                <div className="row-sub">
                  {r.username} · {new Date(r.created_at).toLocaleString()}
                </div>
              </div>
              {user?.role === "admin" && (
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>
                  Delete
                </button>
              )}
            </div>

            <div className="chip-row">
              {flaggedDimensions(r).map((d) => (
                <span key={d.key} className={`badge ${LEVEL_STYLE[r[d.key]]?.badge || "badge-gray"}`}>
                  {d.label}: {levelLabel(d.key, r[d.key])}
                </span>
              ))}
            </div>

            {r.comment && (
              <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.55, marginTop: 10 }}>{r.comment}</p>
            )}
          </div>
        ))}

        {reports && visible.length === 0 && (
          <EmptyState
            icon={<IconBus size={26} c="var(--dim)" />}
            title={filter ? "Nothing reported for that" : "No bus reports yet"}
            hint={
              filter
                ? "Try another category, or check All."
                : "Riders on board can flag cleanliness, crowding and driving."
            }
          />
        )}
      </div>

      {open && (
        <Sheet
          title="Report this bus"
          subtitle="Flag anything you noticed — one, two or all three"
          onClose={() => setOpen(false)}
        >
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
              <div style={{ fontSize: 13, color: "var(--muted)" }}>Thank you for helping other riders.</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ padding: 20 }}>
              {error && <div className="alert alert-error">{error}</div>}

              {/* Which bus — auto-selected when the rider is only on one. */}
              {rideable.length > 1 ? (
                <>
                  <div className="card-label">Which bus are you on?</div>
                  <div className="stack" style={{ marginBottom: 20 }}>
                    {rideable.map((b) => {
                      const active = String(form.bus) === String(b.bus);
                      return (
                        <button
                          key={b.bus}
                          type="button"
                          className="row-card"
                          onClick={() => setForm({ ...form, bus: b.bus })}
                          style={active ? { border: "2px solid var(--brand)", background: "var(--brand-tint)" } : undefined}
                        >
                          <RouteBadge route={{ id: b.route, route_number: b.route_number, route_name: b.route_name }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="row-title">{b.route_name || b.plate_no}</div>
                            <div className="row-sub">{b.plate_no}</div>
                          </div>
                          {active && <IconCheck c="var(--brand)" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                rideable[0] && (
                  <div className="card" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <RouteBadge
                      route={{
                        id: rideable[0].route,
                        route_number: rideable[0].route_number,
                        route_name: rideable[0].route_name,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="row-title">{rideable[0].route_name || rideable[0].plate_no}</div>
                      <div className="row-sub">{rideable[0].plate_no}</div>
                    </div>
                  </div>
                )
              )}

              {DIMENSIONS.map((d) => (
                <div key={d.key} style={{ marginBottom: 20 }}>
                  <div className="card-label" style={{ marginBottom: 8 }}>
                    {d.question} <span style={{ fontWeight: 500, textTransform: "none" }}>· optional</span>
                  </div>
                  <div className="choice-grid">
                    {d.levels.map((l) => {
                      const active = form[d.key] === l.value;
                      const style = LEVEL_STYLE[l.value];
                      return (
                        <button
                          key={l.value}
                          type="button"
                          className="choice"
                          onClick={() => pick(d.key, l.value)}
                          style={
                            active
                              ? { border: `2px solid ${style.color}`, background: style.tint, color: style.color, padding: 12 }
                              : undefined
                          }
                        >
                          {l.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="field">
                <label>
                  Anything else <span style={{ fontWeight: 400, color: "var(--dim)" }}>(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  placeholder="Details other riders should know…"
                />
              </div>

              <button className="btn btn-primary btn-lg" disabled={submitting || !ready}>
                {submitting ? "Submitting…" : flagged ? "Submit report" : "Choose at least one"}
              </button>
            </form>
          )}
        </Sheet>
      )}
    </>
  );
}
