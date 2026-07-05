import client from "./client";

export const busesApi = {
  list: (routeId) =>
    client
      .get("/buses/", { params: routeId ? { route: routeId } : {} })
      .then((r) => r.data),
  get: (id) => client.get(`/buses/${id}/`).then((r) => r.data),
  create: (payload) => client.post("/buses/", payload).then((r) => r.data),
  update: (id, payload) => client.patch(`/buses/${id}/`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/buses/${id}/`),
  updateLocation: (id, payload) =>
    client.patch(`/buses/${id}/update-location/`, payload).then((r) => r.data),
  eta: (id, stopId) =>
    client.get(`/buses/${id}/eta/`, { params: { stop_id: stopId } }).then((r) => r.data),
};
