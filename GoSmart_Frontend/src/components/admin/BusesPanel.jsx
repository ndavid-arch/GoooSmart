import { useState } from "react";
import { usePolling } from "../../hooks/usePolling";
import { busesApi } from "../../api/buses";
import { routesApi } from "../../api/routes";
import { apiErrorMessage } from "../../api/client";
import { LiveBadge } from "../Badges";
import { EmptyState } from "../Loading";

const BLANK = { plate_no: "", capacity: "", route: "", driver: "" };

export default function BusesPanel() {
  const { data: buses, refetch } = usePolling(() => busesApi.list(), 8000);
  const { data: routes } = usePolling(() => routesApi.list(), 20000);

  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const payload = {
        plate_no: form.plate_no,
        capacity: Number(form.capacity),
        route: form.route ? Number(form.route) : null,
        driver: form.driver ? Number(form.driver) : null,
      };
      if (editingId) {
        await busesApi.update(editingId, payload);
      } else {
        await busesApi.create(payload);
      }
      setForm(BLANK);
      setEditingId(null);
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not save this bus."));
    } finally {
      setBusy(false);
    }
  }

  function handleEdit(bus) {
    setEditingId(bus.id);
    setForm({
      plate_no: bus.plate_no,
      capacity: bus.capacity,
      route: bus.route || "",
      driver: bus.driver || "",
    });
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this bus?")) return;
    await busesApi.remove(id);
    refetch();
  }

  return (
    <div className="grid-2" style={{ alignItems: "start" }}>
      <div className="card">
        <div className="card-title">🚌 Buses ({(buses || []).length})</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 500, overflowY: "auto" }}>
          {(buses || []).map((b) => (
            <div
              key={b.id}
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
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <strong style={{ fontSize: 14 }}>{b.plate_no}</strong>
                  <LiveBadge live={b.is_live} />
                </div>
                <div style={{ fontSize: 12, color: "var(--gray-400)" }}>
                  {b.route_name || "No route"} · {b.driver_name ? `Driver: ${b.driver_name}` : "No driver"} · Capacity{" "}
                  {b.capacity}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(b)}>
                  Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {buses && buses.length === 0 && <EmptyState icon="🚌" title="No buses yet" />}
        </div>
      </div>

      <div className="card">
        <div className="card-title">{editingId ? "Edit bus" : "Add a bus"}</div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Plate number</label>
            <input
              required
              value={form.plate_no}
              onChange={(e) => setForm({ ...form, plate_no: e.target.value })}
              placeholder="RAC-100A"
            />
          </div>
          <div className="field">
            <label>Capacity</label>
            <input
              type="number"
              min={1}
              required
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Route</label>
            <select value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })}>
              <option value="">Unassigned</option>
              {(routes || []).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.route_name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Driver's user ID</label>
            <input
              type="number"
              value={form.driver}
              onChange={(e) => setForm({ ...form, driver: e.target.value })}
              placeholder="e.g. 2"
            />
            <span style={{ fontSize: 12, color: "var(--gray-400)" }}>
              Check the Django admin panel (/admin/) for a driver's numeric user ID.
            </span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" disabled={busy}>
              {busy ? "Saving..." : editingId ? "Save changes" : "Add bus"}
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
