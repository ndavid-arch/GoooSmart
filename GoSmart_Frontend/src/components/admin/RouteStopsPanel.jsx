import { useState } from "react";
import { usePolling } from "../../hooks/usePolling";
import { routesApi, stopsApi, routeStopsApi } from "../../api/routes";
import { apiErrorMessage } from "../../api/client";
import { EmptyState } from "../Loading";

const BLANK = { route: "", stop: "", stop_order: 1 };

export default function RouteStopsPanel() {
  const { data: routes } = usePolling(() => routesApi.list(), 20000);
  const { data: stops } = usePolling(() => stopsApi.list(), 20000);
  const { data: links, refetch } = usePolling(() => routeStopsApi.list(), 10000);

  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [filterRoute, setFilterRoute] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await routeStopsApi.create({
        route: Number(form.route),
        stop: Number(form.stop),
        stop_order: Number(form.stop_order),
      });
      setForm({ ...BLANK, route: form.route, stop_order: Number(form.stop_order) + 1 });
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not link this stop to the route."));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this stop from the route?")) return;
    await routeStopsApi.remove(id);
    refetch();
  }

  const routeName = (id) => (routes || []).find((r) => r.id === id)?.route_name || `Route #${id}`;
  const visibleLinks = (links || [])
    .filter((l) => !filterRoute || String(l.route) === String(filterRoute))
    .sort((a, b) => a.route - b.route || a.stop_order - b.stop_order);

  return (
    <div className="grid-2" style={{ alignItems: "start" }}>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>
            🔗 Route ↔ Stop links
          </div>
          <select value={filterRoute} onChange={(e) => setFilterRoute(e.target.value)} style={{ maxWidth: 180 }}>
            <option value="">All routes</option>
            {(routes || []).map((r) => (
              <option key={r.id} value={r.id}>
                {r.route_name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 460, overflowY: "auto" }}>
          {visibleLinks.map((l) => (
            <div
              key={l.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 12px",
                borderRadius: 10,
                background: "var(--gray-50)",
              }}
            >
              <div>
                <span className="badge badge-blue" style={{ marginRight: 8 }}>
                  #{l.stop_order}
                </span>
                <strong style={{ fontSize: 14 }}>{l.stop_name}</strong>
                <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{routeName(l.route)}</div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(l.id)}>
                Remove
              </button>
            </div>
          ))}
          {links && visibleLinks.length === 0 && <EmptyState icon="🔗" title="No stops linked yet" />}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Link a stop to a route</div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Route</label>
            <select
              required
              value={form.route}
              onChange={(e) => setForm({ ...form, route: e.target.value })}
            >
              <option value="">Select a route...</option>
              {(routes || []).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.route_name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Stop</label>
            <select required value={form.stop} onChange={(e) => setForm({ ...form, stop: e.target.value })}>
              <option value="">Select a stop...</option>
              {(stops || []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.stop_name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Stop order (position along the route)</label>
            <input
              type="number"
              min={1}
              required
              value={form.stop_order}
              onChange={(e) => setForm({ ...form, stop_order: e.target.value })}
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? "Linking..." : "Link stop"}
          </button>
        </form>
      </div>
    </div>
  );
}
