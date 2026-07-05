import { useState } from "react";
import { usePolling } from "../../hooks/usePolling";
import { routesApi } from "../../api/routes";
import { apiErrorMessage } from "../../api/client";
import { EmptyState } from "../Loading";

const BLANK = { route_name: "", start_point: "", end_point: "" };

export default function RoutesPanel() {
  const { data: routes, refetch } = usePolling(() => routesApi.list(), 20000);
  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (editingId) {
        await routesApi.update(editingId, form);
      } else {
        await routesApi.create(form);
      }
      setForm(BLANK);
      setEditingId(null);
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not save this route."));
    } finally {
      setBusy(false);
    }
  }

  function handleEdit(route) {
    setEditingId(route.id);
    setForm({ route_name: route.route_name, start_point: route.start_point, end_point: route.end_point });
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this route?")) return;
    await routesApi.remove(id);
    refetch();
  }

  return (
    <div className="grid-2" style={{ alignItems: "start" }}>
      <div className="card">
        <div className="card-title">🗺️ Routes ({(routes || []).length})</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 460, overflowY: "auto" }}>
          {(routes || []).map((r) => (
            <div
              key={r.id}
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
                <div style={{ fontWeight: 700, fontSize: 14 }}>{r.route_name}</div>
                <div style={{ fontSize: 12, color: "var(--gray-400)" }}>
                  {r.start_point} → {r.end_point} · {r.route_stops?.length || 0} stops
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(r)}>
                  Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {routes && routes.length === 0 && <EmptyState icon="🗺️" title="No routes yet" />}
        </div>
      </div>

      <div className="card">
        <div className="card-title">{editingId ? "Edit route" : "Add a route"}</div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Route name</label>
            <input
              required
              value={form.route_name}
              onChange={(e) => setForm({ ...form, route_name: e.target.value })}
              placeholder="Nyabugogo–Kimironko"
            />
          </div>
          <div className="field">
            <label>Start point</label>
            <input
              required
              value={form.start_point}
              onChange={(e) => setForm({ ...form, start_point: e.target.value })}
            />
          </div>
          <div className="field">
            <label>End point</label>
            <input
              required
              value={form.end_point}
              onChange={(e) => setForm({ ...form, end_point: e.target.value })}
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" disabled={busy}>
              {busy ? "Saving..." : editingId ? "Save changes" : "Add route"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setEditingId(null);
                  setForm(BLANK);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
