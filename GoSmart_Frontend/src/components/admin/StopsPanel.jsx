import { useState } from "react";
import { usePolling } from "../../hooks/usePolling";
import { stopsApi } from "../../api/routes";
import { apiErrorMessage } from "../../api/client";
import { EmptyState } from "../Loading";

const BLANK = { stop_name: "", latitude: "", longitude: "" };

export default function StopsPanel() {
  const { data: stops, refetch } = usePolling(() => stopsApi.list(), 20000);
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
        await stopsApi.update(editingId, form);
      } else {
        await stopsApi.create(form);
      }
      setForm(BLANK);
      setEditingId(null);
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not save this stop."));
    } finally {
      setBusy(false);
    }
  }

  function handleEdit(stop) {
    setEditingId(stop.id);
    setForm({ stop_name: stop.stop_name, latitude: stop.latitude, longitude: stop.longitude });
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this stop? Routes linking to it may be affected.")) return;
    await stopsApi.remove(id);
    refetch();
  }

  return (
    <div className="grid-2" style={{ alignItems: "start" }}>
      <div className="card">
        <div className="card-title">🚏 Stops ({(stops || []).length})</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 460, overflowY: "auto" }}>
          {(stops || []).map((s) => (
            <div
              key={s.id}
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
                <div style={{ fontWeight: 700, fontSize: 14 }}>{s.stop_name}</div>
                <div style={{ fontSize: 12, color: "var(--gray-400)" }}>
                  {s.latitude}, {s.longitude}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(s)}>
                  Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {stops && stops.length === 0 && <EmptyState icon="🚏" title="No stops yet" />}
        </div>
      </div>

      <div className="card">
        <div className="card-title">{editingId ? "Edit stop" : "Add a stop"}</div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Stop name</label>
            <input
              required
              value={form.stop_name}
              onChange={(e) => setForm({ ...form, stop_name: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Latitude</label>
            <input
              required
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              placeholder="-1.945600"
            />
          </div>
          <div className="field">
            <label>Longitude</label>
            <input
              required
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              placeholder="30.125300"
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" disabled={busy}>
              {busy ? "Saving..." : editingId ? "Save changes" : "Add stop"}
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
